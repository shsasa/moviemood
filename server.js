const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const path = require('path')
//Middlewares
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')
const session = require('express-session')
const passUserToView = require('./middleware/pass-user-to-view')
const isSignedIn = require('./middleware/is-signed-in')

// Set the port to 3000
const port = process.env.PORT ? process.env.PORT : '3000'
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})

// Middleware to parse URL-encoded data from forms (Body Parser)
app.use(express.urlencoded({ extended: false }))

// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride('_method'))

// Morgan for logging HTTP requests
app.use(morgan('dev'))

//for css
app.use(express.static(path.join(__dirname, 'public')))

// Session configurations
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)

//Require Controller
const authController = require('./controllers/auth')
const usersController = require('./controllers/users')
app.use('/auth', authController)
app.use('/users', usersController)
app.use(passUserToView)

//GET METHOD
app.get('/', async (req, res) => {
  res.render('index.ejs')
})

//listen to port
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`)
})
