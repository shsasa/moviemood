const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

//controller
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})

router.post('/sign-up', async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username })
  if (userInDatabase) {
    return res.send('Username already taken')
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.send('Password and confirm password must match')
  }
  if (!req.body.image || req.body.image.trim() === '') {
    delete req.body.image
  }

  //Register the user
  //bcrypt for password encryption
  const hashedPassword = bcrypt.hashSync(req.body.password, 10)
  req.body.password = hashedPassword

  //Create the user
  const user = await User.create(req.body)
  //res.send(`Thanks for signing up ${user.username}
  // `)
  res.redirect('/auth/sign-in')
})

router.get('/sign-in', async (req, res) => {
  res.render('auth/sign-in.ejs')
})

router.get('/sign-out', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.post('/sign-in', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (!userInDatabase) {
      return res.send('Login failed. Please try again later.')
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    )
    if (!validPassword) {
      return res.send('Login failed. Please try again later.')
    }

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
      image: userInDatabase.image
    }

    res.redirect('/')
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
