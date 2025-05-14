const router = require('express').Router()

const apiKey = process.env.API_KEY

const Movie = require('../models/movie')

const axios = require('axios')

router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find()
    res.render('movies/index.ejs', { movies })
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

// search movies
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm
    const page = req.query.page || 1 // Default to page 1 if no page is specified
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchTerm}&page=${page}`
    )
    const movies = response.data.results
    const totalPages = response.data.total_pages
    res.render('movies/search.ejs', {
      movies,
      searchTerm,
      currentPage: page,
      totalPages
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

// add movie to favorites
router.post('/add', async (req, res) => {
  try {
    const { title, apiId, poster_path } = req.body
    const movie = await Movie.create({ title, apiId, poster_path })
    // add the movie to the user favorites
    // Assuming you have a user session and a User model
    console.log(req.session.user)
    const user = await User.findById(req.session.user._id)
    if (user) {
      user.favorites.push(movie._id)
      await user.save()
    }
    res.redirect('/movies')
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
