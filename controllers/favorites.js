const router = require('express').Router()

const apiKey = process.env.API_KEY
const Movie = require('../models/movie')
const User = require('../models/user')
const axios = require('axios')

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)

    const favoriteMovies = await Movie.find({
      _id: { $in: user.favoriteMovies }
    })

    res.render('favorites/index.ejs', { favoriteMovies })
  } catch (err) {
    console.error('Error fetching favorite movies:', err)
    res.status(500).send('Internal Server Error')
  }
})

router.delete('/:apiId', async (req, res) => {
  try {
    const apiId = req.params.apiId
    console.log('Removing movie from favorites:', apiId)
    // Find the movie in the database
    const movie = await Movie.findOne({ apiId })
    if (!movie) {
      return res.status(404).send('Movie not found')
    }
    // Remove the movie from the user's favorite movies
    await User.findByIdAndUpdate(req.session.user._id, {
      $pull: { favoriteMovies: movie._id }
    })
    const url = `/movies/${movie.apiId}`
    res.redirect(url)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, apiId, poster_path } = req.body
    console.log('Adding movie to favorites:', { title, apiId, poster_path })
    const movie = await Movie.findOrCreate({ title, apiId, poster_path })

    await User.findByIdAndUpdate(req.session.user._id, {
      $push: { favoriteMovies: movie._id }
    })

    console.log(movie.apiId)
    const url = `/movies/${movie.apiId}`
    res.redirect(url)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
