const mongoose = require('mongoose')
const validator = require('validator');
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
      
    },
    image: {
      type: String,

      default: 'https://i.imgur.com/dM7Thhn.png'
      
    },
    favoriteMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
      }
    ]
  },
  {
    timestamps: true
  }
)
const User = mongoose.model('User', userSchema)
module.exports = User
