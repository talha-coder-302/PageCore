const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: 'user',
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  refreshToken:{
    type:String
  },
});

module.exports = mongoose.model('User', userSchema);