const SupportTicket = require('../models/SupportTicket');
const ChatMessage = require('../models/ChatMessage');
const { notify } = require('../utils/notify');

const CATEGORIES = ['Booking', 'Payment', 'Cancellation', 'Modification', 'Loyalty', 'Other'];
const STATUSES = ['open', 'pending', 'resolved', 'closed'];

// GET /api/support/tickets — own tickets, paginated, latest first
exports.listTickets = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const filter = { user: req.user._id };
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    const [items, total] = await Promise.all([
      SupportTicket.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      SupportTicket.countDocuments(filter),
    ]);
    res.json({ success: true, count: items.length, total, page, pages: Math.ceil(total / limit), data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load tickets', error: error.message });
  }
};

// POST /api/support/tickets — { subject, category, priority, bookingId?, message }
exports.createTicket = async (req, res) => {
  try {
    const { subject, category = 'Booking', priority = 'normal', bookingId, message } = req.body;
    if (!subject || String(subject).trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Subject must be at least 3 characters' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }
    const ticket = await SupportTicket.create({
      user: req.user._id, subject: String(subject).trim(), category, priority,
      booking: bookingId || null,
    });
    if (message && String(message).trim()) {
      await ChatMessage.create({ ticket: ticket._id, sender: req.user._id, senderRole: 'user', text: String(message).trim().slice(0, 2000) });
    }
    await notify(req.user._id, 'ticket-created', `Support ticket opened: ${ticket.subject}`);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create ticket', error: error.message });
  }
};

// GET /api/support/tickets/:id — owner or admin
exports.getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('booking', 'guestName checkIn checkOut status').lean();
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (String(ticket.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load ticket', error: error.message });
  }
};

// PATCH /api/support/tickets/:id — owner: close; admin: any status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${STATUSES.join(', ')}` });
    }
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    const isOwner = String(ticket.user) === String(req.user._id);
    if (req.user.role !== 'admin' && !(isOwner && status === 'closed')) {
      return res.status(403).json({ success: false, message: 'Only support agents can change ticket status' });
    }
    ticket.status = status;
    await ticket.save();
    if (req.user.role === 'admin') await notify(ticket.user, 'ticket-status', `Ticket "${ticket.subject}" is now ${status}`);
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ticket', error: error.message });
  }
};

// GET /api/support/tickets/:id/messages?after=&limit= — polling-friendly
exports.listMessages = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (String(ticket.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view these messages' });
    }
    const filter = { ticket: ticket._id };
    if (req.query.after) filter.createdAt = { $gt: new Date(req.query.after) };
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const messages = await ChatMessage.find(filter).populate('sender', 'name').sort({ createdAt: 1 }).limit(limit).lean();
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load messages', error: error.message });
  }
};

// POST /api/support/tickets/:id/messages — { text }
exports.postMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || String(text).trim().length < 1) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    const isOwner = String(ticket.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reply here' });
    }
    if (['resolved', 'closed'].includes(ticket.status) && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: `Ticket is ${ticket.status}` });
    }
    const role = req.user.role === 'admin' ? 'agent' : 'user';
    const msg = await ChatMessage.create({
      ticket: ticket._id, sender: req.user._id, senderRole: role, text: String(text).trim().slice(0, 2000),
    });
    if (ticket.status === 'open' && role === 'agent') ticket.status = 'pending';
    if (role === 'user' && ticket.status === 'pending') ticket.status = 'open';
    ticket.updatedAt = new Date();
    await ticket.save();
    if (role === 'agent') await notify(ticket.user, 'ticket-reply', `New reply on: ${ticket.subject}`);
    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};
