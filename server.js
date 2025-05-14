const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()


const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')
const session = require('express-session')
const passUserToView = require('./middleware/pass-user-to-view')
const isSignedIn = require('./middleware/is-signed-in')


const port = process.env.PORT ? process.env.PORT : '3000'
mongoose.connect(process.env.MONGODB_URI)


mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
app.use(passUserToView)


const authController = require('./controllers/auth')
const usersController = require('./controllers/users')
app.use(express.urlencoded({ extended: false }))

app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use('/auth', authController)
app.use('/users', usersController)

app.get('/', async (req, res) => {
  res.render('index.ejs')
})



app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`)
})
