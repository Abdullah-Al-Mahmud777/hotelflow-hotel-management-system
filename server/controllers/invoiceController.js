const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');

// GET /api/v1/bookings/:id/invoice.pdf — verified-record PDF confirmation+invoice.
// Ownership-checked; streams application/pdf.
exports.getInvoicePdf = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room', 'name type price')
      .populate('user', 'name email')
      .lean();
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const owns =
      (booking.user && String(booking.user._id || booking.user) === String(req.user._id)) ||
      booking.guestEmail === req.user.email;
    if (!owns) return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });

    const nights = Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000));
    const subtotal = Number(booking.totalPrice || 0) + Number(booking.discount || 0);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="hotelflow-invoice-${booking._id}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    doc.fontSize(22).text('HotelFlow', { align: 'left' });
    doc.fontSize(11).fillColor('#555').text('Booking Confirmation & Invoice');
    doc.moveDown();
    doc.fillColor('#000').fontSize(12).text(`Confirmation: ${booking._id}`);
    doc.fontSize(11)
      .text(`Guest: ${booking.guestName} <${booking.guestEmail}>`)
      .text(`Phone: ${booking.guestPhone || '—'}`)
      .text(`Room: ${booking.room?.name || '—'} (${booking.room?.type || '—'})`)
      .text(`Check-in: ${new Date(booking.checkIn).toLocaleDateString()}   Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`)
      .text(`Nights: ${nights}   Guests: ${booking.numberOfGuests ?? 1}`)
      .text(`Status: ${booking.status}`);
    if (booking.specialRequests) doc.text(`Special requests: ${booking.specialRequests}`);
    doc.moveDown();
    doc.text(`Room rate: $${booking.room?.price ?? '—'}/night`);
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`);
    if (booking.couponCode) doc.text(`Coupon ${booking.couponCode}: -$${Number(booking.discount || 0).toFixed(2)}`);
    doc.fontSize(14).text(`Total charged: $${Number(booking.totalPrice || 0).toFixed(2)}`);
    doc.moveDown().fontSize(10).fillColor('#555')
      .text(`Issued ${new Date().toLocaleString()} • HotelFlow Hotel Booking System`);
    doc.end();
  } catch (err) {
    console.error('[invoiceController.getInvoicePdf]', err);
    if (!res.headersSent) return res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
};
