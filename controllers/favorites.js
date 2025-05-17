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

router.post('/add', async (req, res) => {
  try {
    const { title, apiId, poster_path } = req.body
    const movie = await Movie.create({ title, apiId, poster_path })
    // add the movie to the user favorites
    // Assuming you have a user session and a User model
    await User.findByIdAndUpdate(req.session.user._id, {
      $push: { favoriteMovies: movie._id }
    })

    // Redirect to the movie details page or wherever you want
    console.log(movie.apiId)
    const url = `/movies/${movie.apiId}`
    res.redirect(url)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const apiId = req.body.id
    const user = await User.findById(req.session.user._id, {
      $pull: { favoriteMovies: movie._id }
    })

    res.redirect(`/${apiId}`)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, apiId, poster_path } = req.body
    const movie = await Movie.create({ title, apiId, poster_path })
    // add the movie to the user favorites
    // Assuming you have a user session and a User model
    await User.findByIdAndUpdate(req.session.user._id, {
      $push: { favoriteMovies: movie._id }
    })

    // Redirect to the movie details page or wherever you want
    console.log(movie.apiId)
    const url = `/movies/${movie.apiId}`
    res.redirect(url)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
