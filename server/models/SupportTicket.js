const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true, maxlength: 140 },
  category: {
    type: String, enum: ['Booking', 'Payment', 'Cancellation', 'Modification', 'Loyalty', 'Other'],
    default: 'Booking',
  },
  status: {
    type: String, enum: ['open', 'pending', 'resolved', 'closed'], default: 'open',
  },
  priority: { type: String, enum: ['low', 'normal', 'urgent'], default: 'normal' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
}, { timestamps: true });

ticketSchema.index({ user: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model('SupportTicket', ticketSchema);
