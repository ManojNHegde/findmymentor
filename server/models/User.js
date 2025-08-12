const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['mentor', 'learner'],
    default: 'learner',
    required: true
  },

  // Optional mentor profile fields
  skills: {
    type: [String], // Array of strings
    default: []
  },

  experience: {
    type: String,
    default: ''
  },

  availability: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('User', userSchema);
