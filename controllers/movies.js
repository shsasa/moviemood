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

router.get('/:id', async (req, res) => {
  try {
    // get movies from the api
    const movieId = req.params.id
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
    )
    const movie = response.data
    // check if the movie is already in the database
    const trailerResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`
    )
    const trailers = trailerResponse.data.results
    const trailer = trailers.find((video) => video.type === 'Trailer' && video.site === 'YouTube')
    const trailerKey = trailer ? trailer.key : null
    const existingMovie = await Movie.findOrCreate({
      title: movie.title,
      apiId: movieId,
      poster_path: movie.poster_path
    })

    if (req.session.user) {
      const user = await User.findById(req.session.user._id)
      // check if the movie is in the user's favorite movies
      const isFavorite = user.favoriteMovies.some(
        (favoriteMovie) =>
          favoriteMovie.toString() === existingMovie._id.toString()
      )
      console.log('isFavorite')
      console.log(isFavorite)
      res.render('movies/show.ejs', { movie, isFavorite: isFavorite, trailerKey })
    } else {
      res.render('movies/show.ejs', { movie, isFavorite: false, trailerKey })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
