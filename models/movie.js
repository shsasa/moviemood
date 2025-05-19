const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String
    },
    apiId: {
      type: String,
      unique: true,
      required: true
    },
    poster_path: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

movieSchema.statics.findOrCreate = async function ({
  title,
  apiId,
  poster_path
}) {
  if (apiId === undefined) {
    console.warn('❌ Missing apiId:', { title, poster_path })
  }
  let movie = await this.findOne({ apiId })
  if (!movie) {
    movie = await this.create({ title, apiId, poster_path })
  }
  return movie
}
const Movie = mongoose.model('Movie', movieSchema)
module.exports = Movie
