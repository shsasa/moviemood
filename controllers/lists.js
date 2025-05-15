//controllers
const router = require('express').Router()
const Movie = require('../models/movie')
const axios = require('axios')
const User = require('../models/user')
const List = require('../models/list')

//show all lists for the sign-in user
router.get('/', async (req, res) => {
  const lists = await List.find({ user: req.session.user._id })
  res.render('lists/index.ejs', { lists })
})

//new - form to create new list
router.get('/new', async (req, res) => {
  const movies = await Movie.find()
  res.render('lists/new.ejs', { movies })
})

//create - to get the form submission to create list (POST)
router.post('/', async (req, res) => {
  try {
    const list = new List({
      //defined the list
      title: req.body.title,
      description: req.body.description,
      movies: req.body.movies || [],
      user: req.session.user._id,
      public: req.body.public === 'on'
    })
    await list.save() //to save the list
    res.redirect('/lists')
  } catch (err) {
    //to catch the error
    console.log(err)
    res.redirect('/')
  }
})

module.exports = router
