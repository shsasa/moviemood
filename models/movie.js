const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema(
  {},
  {
    timestamps: true
  }
)
const Movie = mongoose.model('Movie', movieSchema)
module.exports = Movie
