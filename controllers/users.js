const router = require('express').Router()
const User = require('../models/user')
const List = require('../models/list')
const isSignedIn = require('../middleware/is-signed-in');
const upload = require('../middleware/upload')
const Review = require('../models/review')
const Movie = require('../models/movie')

router.get('/', async (req, res) => {
  const users = await User.find()
  res.render('users/index.ejs', { users })
})

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)

  // find all user list and if the list is public
  const lists = await List.find({ user: req.params.id, public: true })
  const reviews = await Review.find({ user: req.params.id }).populate('movie')
  // Extract all movies from the reviews (removing duplicates)
  const moviesInReviews = [
    ...new Map(
      reviews
        .filter(r => r.movie)
        .map(r => [r.movie._id.toString(), r.movie])
    ).values()
  ];

  //add reviews to the moviesInReviews
  moviesInReviews.forEach(movie => {
    const review = reviews.find(r => r.movie._id.toString() === movie._id.toString())
    if (review) {
      movie.review = review
    }
  })




  console.log("moviesInReviews")
  console.log(moviesInReviews)
// check if the user is signed in and if the user is the same as the user in the url
const isSignedInUser = req.session.user && req.session.user._id.toString() === user._id.toString()

  console.log(user)
  res.render('users/show.ejs', { userprofile: user, lists: lists, reviews: moviesInReviews , isSignedInUser })
})

router.get("/:id/edit", isSignedIn, async (req, res) => {
  if (req.params.id !== req.session.user._id.toString()) { return res.send("Unauthorized") }
  const user = await User.findById(req.params.id)

  res.render("users/edit.ejs", { user })
})


router.put("/:id", isSignedIn, upload.single("profileImage"), async (req, res) => {
  if (req.params.id !== req.session.user._id.toString()) {
    return res.send("Unauthorized");
  }
  const { username, email } = req.body;
  const updatedFields = { username, email, }
  if (req.file) {
    updatedFields.image = `/uploads/${req.file.filename}`
  }
  const updatedUser = await User.findByIdAndUpdate(req.params.id,
    updatedFields,
    { new: true }
  );
  req.session.user.username = updatedUser.username
  // res.redirect(`/users/${req.params.id}`);
  if (updatedUser.image) {
    req.session.user.image = updatedUser.image
  }
  res.redirect(`/users/${req.params.id}`)
});
module.exports = router
