const express = require("express")
const router = express.Router();
const Review = require("../models/review")
const isSignedIn = require("../middleware/is-signed-in")

router.post("/",isSignedIn, async(req,res)=>{
  try {
const {movieId, rating, comment}=req.body;
await Review.create({
  rating,
  comment,
  user:req.session.user._id,
  movie: movieId
})
res.redirect(`/movies/${movieId}`)
  } catch (error){
console.error(error)
res.status(500).send('Internal Server Error')
  }
})
module.exports= router;