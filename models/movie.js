const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String
    },
    apiId: {
      type: String,
      unique: true
    },
    poster_path: {
      type: String
    }
  },
  {
    timestamps: true
  }
)
const Movie = mongoose.model('Movie', movieSchema)
module.exports = Movie
