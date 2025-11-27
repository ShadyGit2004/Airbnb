const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  guestName: String,
  guestEmail: String,
  content: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
