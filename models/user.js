const mongoose = require('mongoose')

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
      lowercase: true
    },
    image: {
      type: String,
      default: 'https://i.imgur.com/dM7Thhn.png'
    }
  },
  {
    timestamps: true
  }
)
const User = mongoose.model('User', userSchema)
module.exports = User
