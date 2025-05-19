const router = require('express').Router()
const User = require('../models/user')
const isSignedIn = require('../middleware/is-signed-in');
const upload= require('../middleware/upload')

router.get('/', async (req, res) => {
  const users = await User.find()
  res.render('users/index.ejs', { users })
})

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)

  console.log(user)
  res.render('users/show.ejs', { userprofile: user })
})

router.get("/:id/edit", isSignedIn, async (req,res)=>{
  if (req.params.id !== req.session.user._id.toString()){return res.send("Unauthorized")}
  const user = await User.findById(req.params.id)
  res.render("users/edit.ejs",{user})
})


router.put("/:id", isSignedIn, upload.single("profileImage"), async (req, res) => {
  if (req.params.id !== req.session.user._id.toString()) {
    return res.send("Unauthorized");
  }
  const { username, email} = req.body;
  const updatedFields ={username,email,}
  if(req.file){
    updatedFields.image=`/uploads/${req.file.filename}`
  }
  const updatedUser =await User.findByIdAndUpdate(req.params.id,
    updatedFields,
  {new : true}
);
req.session.user.username = updatedUser.username
  // res.redirect(`/users/${req.params.id}`);
  if(updatedUser.image){
    req.session.user.image = updatedUser.image
  }
  res.redirect(`/users/${req.params.id}`)
});
module.exports = router
