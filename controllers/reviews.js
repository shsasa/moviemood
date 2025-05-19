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
  existingReview.rating = rating;
  existingReview.comment= comment;
  await existingReview.save();

}else{
await Review.create({
  rating,
  comment,
  user:req.session.user._id,
  movie: movie._id
})
}
res.redirect(`/movies/${movieId}`)
  } catch (error){
console.error(error)
res.status(500).send('Internal Server Error')
  }
})
module.exports= router;