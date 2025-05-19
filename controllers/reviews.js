const express = require("express")
const router = express.Router();
const Movie = require("../models/movie")
const Review = require("../models/review")
const isSignedIn = require("../middleware/is-signed-in")

router.post("/",isSignedIn, async(req,res)=>{
  try {
const {movieId, rating, comment}=req.body;

const movie = await Movie.findOne({apiId: movieId})
if (!movie){
  return res.status(404).send("Movie not found in the database.")
}

const existingReview = await Review.findOne({
  user: req.session.user._id,
  movie: movie._id
})
if (existingReview){
  return res.status(400).send("You already reviewed this movie")
}
await Review.create({
  rating,
  comment,
  user:req.session.user._id,
  movie: movie._id
})

res.redirect(`/movies/${movieId}`)
  } catch (error){
console.error(error)
res.status(500).send('Internal Server Error')
  }
})
//update route
router.put("/:reviewId", isSignedIn, async (req,res)=>{
  const {reviewId} = req.params;
  const {rating,comment}= req.body;
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).send("Review not found");

    if (review.user.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("Not authorized");
    }
  review.rating = rating;
  review.comment = comment;
  await review.save();

  const movie = await Movie.findById(review.movie)
  res.redirect(`/movies/${movie.apiId}`)
} catch(error){
console.error(error)
  }
})
module.exports= router;

