//controllers
const router = require('express').Router()
const Movie = require('../models/movie')
const axios = require('axios')
const User = require('../models/user')
const List = require('../models/list')

//show all lists for the sign-in user
router.get('/', async (req, res) => {
  //initialize selected movies in session
  req.session.selectedMovies = []
  //get the user id if logged in
  let userId
  if (req.session.user) {
    userId = req.session.user._id
  }
  //define lists
  let lists
  if (userId) {
    // Show lists owned by this user OR public lists

    //List.find() => its to find all documents (lists)in the List collection that match the condition inside {}
    lists = await List.find({
      //$or its a MongoDB operator, match documents where at least one of the conditions in the arry is true.
      $or: [{ user: userId }, { public: true }]
      // if either belongs to the current user or its public
    }).populate('movies') //load data from each list (get full movie objects) .populate(is Mongoose method to fetch data)
  } else {
    // If no logged-in user, show only public lists
    lists = await List.find({ public: true }).populate('movies')
  }
  //show the list
  res.render('lists/index.ejs', { lists })
})

//new - form to create new list
router.get('/new', async (req, res) => {
  // Initialize session selectedMovies if not already set
  if (!req.session.selectedMovies) { req.session.selectedMovies = [] }

  // clear the session
  if (!req.query.addMovie) {
    req.session.selectedMovies = []
  } else {
    // find movie and add to session
    const apiId = req.query.addMovie

    //we need to save the movie in the database for more than 2 different reasons:
    //1- to avoid fetching the same movie
    //2- use them in the list where objectId only works if the movie stored in the database.

    // to find the movie already saved in DB
    let movie = await Movie.findOne({ apiId })

    if (!movie) {
      //if it not found in the database then get it from API
      const apiKey = process.env.API_KEY
      // Fetch movie info from API
      const url = `https://api.themoviedb.org/3/movie/${apiId}`
      const response = await axios.get(url, {
        //params is query parameters "?key=value" => "?api_key="
        //params is cleaner and safer than manual because it provide errors
        params: {
          api_key: process.env.API_KEY
        }
      })

      //once the API responds, store the data in apiMovie
      const apiMovie = response.data

      // Save new movie in DB


      movie = await Movie.findOrCreate({
        title: apiMovie.title,
        apiId: apiMovie.id,
        poster_path: apiMovie.poster_path
      })

      //.save() is mongoose method that store data permanently in the database
      await movie.save()
    }

    // Add movie ID to session
    //movie._id is MongoDB objectId , .toString() to convert the objectId to string because sessions stores array of strings
    const movieId = movie._id.toString()

    //to check if the id of the movie was not selected then push it (add it) to the list
    if (!req.session.selectedMovies.includes(movieId)) {
      //.include() -> returns boolean and here it checks if this movieId is include inside selectedMovies
      req.session.selectedMovies.push(movieId)
    }
  }

  // Fetch all movies from the database for the checkbox list
  const movies = await Movie.find()

  // Fetch only the movies currently selected and stored in the session
  const selectedMovies = await Movie.find({
    //its a MongoDB query, search in movies collection where the _id field matches any of the IDs in the array.
    _id: { $in: req.session.selectedMovies }
    //$in is a MongoDB operator it check if the value of _id is found in selectedMovies array
  })

  // Render the 'new list' form with all movies and selected ones
  res.render('lists/new.ejs', { movies, selectedMovies })
})

//create - to get the form submission to create the list (POST)
router.post('/', async (req, res) => {
  try {
    // Use selectedMovies from session to req.body.movies
    let moviesToAdd = []

    if (req.session.selectedMovies && req.session.selectedMovies.length > 0) {
      moviesToAdd = req.session.selectedMovies
    } else if (req.body.movies) {
      moviesToAdd = req.body.movies
    }

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

// GET /lists/:id - Show a specific list (single)
router.get('/:id', async (req, res) => {
  try {
    //to find one list document whose _id matches the id in the route.
    const list = await List.findById(req.params.id)
      .populate('movies') //load full movie info
      .populate('user') // load user info for the list owner

    //render the show page for this list
    res.render('lists/show.ejs', { list, session: req.session })
  } catch (err) {
    console.error(err)
    res.redirect('/lists')
  }
})

//edit - to edit the list (GET method)
router.get('/:id/edit', async (req, res) => {
  try {
    //find the list by id.
    const list = await List.findById(req.params.id).populate('movies') //load full movie info

    //check if user is logged in and its the owner of the list
    if (
      !req.session.user ||
      !list.user ||
      !list.user.equals(req.session.user._id)
    ) {
      return res.send("You don't have permission to edit this list.")
    }

    // set the session.selectedMovies to the IDs of movies already in the list
    req.session.selectedMovies = [] //start with an empty array in the session

    //go through each movie in the lists movies array
    list.movies.forEach((movie) => {
      //convert the movies ID to a string and add it to the session array
      req.session.selectedMovies.push(movie._id.toString())
    })

    // If the url has a query to add a movie
    if (req.query.addMovie) {
      const apiId = req.query.addMovie //get movie ID from query

      //check if movie is already saved in database by apiId
      let movie = await Movie.findOne({ apiId })

      // if movie not in database, fetch from API and save it
      if (!movie) {
        const url = `https://api.themoviedb.org/3/movie/${apiId}`
        const response = await axios.get(url, {
          params: { api_key: process.env.API_KEY }
        })
        const apiMovie = response.data

        //create new movie document with data from API
        movie = await Movie.findOrCreate({
          title: apiMovie.title,
          apiId: apiMovie.id,
          poster_path: apiMovie.poster_path
        })
        await movie.save() //save new movie to DB
      }

      //convert movie's MongoDB ID to string
      const movieId = movie._id.toString()

      //add movie to selectedMovies in sessions if not added
      if (!req.session.selectedMovies.includes(movieId)) {
        req.session.selectedMovies.push(movieId)
      }
    }

    //get all movies from database for the movie selection list
    const allMovies = await Movie.find()

    //get the movies that are currently selected in the session
    const selectedMovies = await Movie.find({
      _id: { $in: req.session.selectedMovies }
    })

    //override the list.movies property with the selected movie objects for rendering
    list.movies = selectedMovies

    //render the edit form page, passing list , all movies , and selectedMovies
    res.render('lists/edit.ejs', { list, allMovies, selectedMovies })
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

//update- to update the list (PUT method) // PUT /lists/:id
router.put('/:id', async (req, res) => {
  try {
    //find the list by ID from the url parameter
    const list = await List.findById(req.params.id)

    //check if the logged-in user owns this list
    if (!list.user.equals(req.session.user._id)) {
      //if not the owner
      return res.send("You don't have permission to update this list.")
    }

    //prepare an array for movies to update in the list
    let updatedMovies = []

    //if there are selected movies saved in session, use them
    if (req.session.selectedMovies && req.session.selectedMovies.length > 0) {
      updatedMovies = req.session.selectedMovies
    }
    //else, use movies sent in the form submission (array)
    else if (req.body.movies) {
      updatedMovies = [].concat(req.body.movies || [])
      //.concat() its force it to always become ana array (even if its only one movie selected)
    }

    //update the list fields with new values from the from
    list.title = req.body.title
    list.description = req.body.description
    list.movies = updatedMovies
    //set public to true if checkbox is checked ('on') else false
    list.public = req.body.public === 'on'

    //save the updated list to the database
    await list.save()

    //clear the selected movies in session after saving
    req.session.selectedMovies = []

    //redirect user back to the lists page
    res.redirect('/lists')
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

// DELETE - delete a list
router.delete('/:id', async (req, res) => {
  try {
    //find the list by its ID fom the url
    const list = await List.findById(req.params.id)

    //if the list doesn't exist, show a message
    if (!list) {
      return res.send('List not found.')
    }

    // Check if the logged-in user owns the list
    // only the owner us allowed to delete their own list
    if (!list.user.equals(req.session.user._id)) {
      return res.send("You don't have permission to delete this list.")
    }
    //else delete the list from the database
    await list.deleteOne()

    //after deletion, redirect the user back to the lists page
    res.redirect('/lists')
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

module.exports = router
