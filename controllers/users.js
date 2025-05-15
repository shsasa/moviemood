const router = require('express').Router()
const User = require('../models/user')
const isSignedIn = require('../middleware/is-signed-in');


router.get('/', async (req, res) => {
  const users = await User.find()
  res.render('users/index.ejs', { users })
})

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)

  console.log(user)
  res.render('users/show.ejs', { userprofile: user })
})


module.exports = router
