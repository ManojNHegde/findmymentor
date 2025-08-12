const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined'], 
    default: 'pending' 
  }, // pending / accepted / declined
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Optional: Add indexes for faster queries
bookingSchema.index({ studentId: 1 });
bookingSchema.index({ mentorId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
