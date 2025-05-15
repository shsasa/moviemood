const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    image: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)
const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
