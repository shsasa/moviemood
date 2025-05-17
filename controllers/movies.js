const router = require('express').Router()

const apiKey = process.env.API_KEY

const Movie = require('../models/movie')

const axios = require('axios')
const User = require('../models/user')

router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find()
    res.render('movies/index.ejs', { movies })
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
}) // show all favorite movies

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
router.post('/favorites/add', async (req, res) => {
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



router.get('/:id', async (req, res) => {
  try {
    // get movies from the api
    const movieId = req.params.id
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
    )
    const movie = response.data
    // check if the movie is already in the database
    const existingMovie = await Movie.findOne({ apiId: movieId })
    if (!existingMovie) {
      await Movie.findOrCreate({
        title: movie.title,
        apiId: movieId,
        poster_path: movie.poster_path
      })
    }

    if (req.session.user) {
      const user = await User.findById(req.session.user._id)
      const isFavorite = user.favoriteMovies.some(
        (fav) => fav.apiId === movieId
      )
      res.render('movies/show.ejs', { movie, isFavorite })
    } else {
      res.render('movies/show.ejs', { movie, isFavorite: false })
    }


  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
