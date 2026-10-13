const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = system/assistant
  senderRole: { type: String, enum: ['user', 'agent', 'assistant', 'system'], required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });

messageSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', messageSchema);
