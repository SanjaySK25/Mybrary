const express = require('express')
const fs = require('fs')
const router = express.Router()
const Book = require('../models/book')
const path = require('path')
const uploadPath = path.join('public', Book.coverImageBasePath)
const Author = require('../models/author')
const multer = require('multer')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All Books
router.get('/', async (req,res) => {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try{
        const books = await query.exec()
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
    }catch{

    }
})

// New Book
router.get('/new', async (req,res) => {
    renderNewPage(res, new Book())
})

// Creating the new Book
router.post('/', upload.single('cover') ,async (req,res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })
    try{
        const newBook = await book.save()
        //res.redirect(`books/${newBook.id}`)
        res.redirect(`books`)
    }catch(error){
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
        console.error(error)
    }
})

async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({})
        const book = new Book()
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = 'Error creating Book'
        res.render('books/new',params)
    }catch{
        res.redirect('/books')
    }
}

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}

module.exports = router