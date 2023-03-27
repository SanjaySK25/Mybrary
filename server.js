if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


const express = require('express') // importing express
const app = express() // getting the app portion from the express package we imported
const expressLayouts = require('express-ejs-layouts') // importing express layout package
const bodyParser = require('body-parser')

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')

app.set('view engine','ejs') // setting the view engine to ejs
app.set('views', __dirname + '/views') // setting the location of views
app.set('layout', 'layouts/layout') // setting the base layout
app.use(expressLayouts) // setting to use the express layouts
app.use(express.static('public')) // telling where our public files are
app.use(bodyParser.urlencoded({ limit:'10mb', extended:false }));

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', () => console.log('error'));
db.once('open', () => console.log("Connected to Mongoose!"))

app.use('/', indexRouter)
app.use('/authors', authorRouter)

app.listen(process.env.PORT || 3000) // Basically connects you to a port