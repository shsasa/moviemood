//controllers
const router = require('express').Router()
const Movie = require('../models/movie')
const axios = require('axios')
const User = require('../models/user')
const List = require('../models/list')

//show all lists for the sign-in user
router.get('/', async (req, res) => {
  req.session.selectedMovies = []
  const userId = req.session.user?._id;

  let lists;
  if (userId) {
    // Show lists owned by this user OR public lists
    lists = await List.find({
      $or: [
        { user: userId },
        { public: true }
      ]
    }).populate('movies');
  } else {
    // If no logged-in user, show only public lists
    lists = await List.find({ public: true }).populate('movies');
  }
  res.render('lists/index.ejs', { lists })
})

//new - form to create new list
router.get('/new', async (req, res) => {
  // Initialize session selectedMovies
  if (!req.session.selectedMovies) req.session.selectedMovies = []

  // clear the session
  if (!req.query.addMovie) {
    req.session.selectedMovies = []
  } else {
    // find movie and add to session
    const apiId = req.query.addMovie

    // to find the movie already saved in DB
    let movie = await Movie.findOne({ apiId })

    if (!movie) {
      const apiKey = process.env.API_KEY
      // Fetch movie info from API
      const url = `https://api.themoviedb.org/3/movie/${apiId}`;
      const response = await axios.get(url, {
        params: {
          api_key: process.env.API_KEY
        }
      });      

      const apiMovie = response.data

      // Save new movie in DB
      movie = new Movie({
        title: apiMovie.title,
        poster: apiMovie.poster_path,
        apiId: apiMovie.id
      })

      await movie.save()
    }

    // Add movie ID to session
    const movieId = movie._id.toString()

    if (!req.session.selectedMovies.includes(movieId)) {
      req.session.selectedMovies.push(movieId)
    }
  }

  // Fetch all movies for the checkbox list
  const movies = await Movie.find()

  // Fetch only the movies currently selected
  const selectedMovies = await Movie.find({
    _id: { $in: req.session.selectedMovies }
  })


  // Render the 'new list' form with all movies and selected ones
  res.render('lists/new.ejs', { movies, selectedMovies })
})

//create - to get the form submission to create the list (POST)
router.post('/', async (req, res) => {
  try {
    // Use selectedMovies from session to req.body.movies
    const moviesToAdd =
      req.session.selectedMovies.length > 0
        ? req.session.selectedMovies
        : req.body.movies || []

    const list = new List({
      //defined the list
      title: req.body.title,
      description: req.body.description,
      movies: moviesToAdd,
      user: req.session.user._id,
      public: req.body.public === 'on'
    })
    await list.save() //to save the list

    // Clear the session selected movies after saving
    req.session.selectedMovies = []

    res.redirect('/lists')
  } catch (err) {
    //to catch the error
    console.log(err)
    res.redirect('/')
  }
})

module.exports = router
