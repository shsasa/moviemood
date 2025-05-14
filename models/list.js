const mongoose = require('mongoose')
const { title } = require('process')

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    movies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
      }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    public: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)
const List = mongoose.model('List', listSchema)
module.exports = List
