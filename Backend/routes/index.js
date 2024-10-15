import express from 'express'
const router = express.Router()

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import auth from '../middleware/auth.js'
import multer from '../middleware/multer-config.js'
import fs from 'fs'

import Book from '../models/book.js'
import User from '../models/user.js'

router.get('/books', (req, res) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }))
})

router.get('/books/:id', (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }))
})

router.get('/books/bestrating', (req, res) => {
    Book.find()
        .then(brtg => res.status(200).json(brtg))
        .catch(error => res.status(400).json({ error }))
})

router.post('/auth/signup', (req, res) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })
            user.save()
                .then(() => res.status(201).json({ message: 'user saved, welcome !'}))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
})

router.post('/auth/login', (req, res) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (user === null) res.status(401).json({message: "Idantifiant/mot de passe inccorects"})
            else bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if(!valid) res.status(401).json({mesage: "Idantifiants/mot de passe incorrects"})
                    else res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            process.env.JWT_SECRET,
                            {expiresIn: '24h'}
                        )
                    })
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
})

router.post('/books', auth, multer, (req, res) => {
    const addedBook = JSON.parse(req.body.book)
    delete addedBook._id
    delete addedBook._userId
    const book = new Book({
        ...addedBook,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    book.save()
        .then(() => res.status(201).json({ message: 'book saved !'}))
        .catch(error => res.status(400).json({ error }))
})

router.post('/books/:id/rating', auth, (req, res) => {
    delete req.body._id
    const book = new Book(...req.body)
    book.save()
        .then(() => res.status(201).json({ message: 'Rating saved !'}))
        .catch(error => res.status(400).json({ error }))
})

router.put('/books/:id', auth, multer, (req, res) => {
    const modBook = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete modBook._userId
    Book.findOne({_id: req.params.id})
        .then(book => {
            if(book.userId !== req.auth.userId) {
                res.status(401).json({message : "Not authorized"})
            } else {
                Book.updateOne({ _id: req.params.id }, { ...modBook, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'book updated with success !'}))
                    .catch(error => res.status(400).json({ error }))
            }
        })
        .catch(error => {res.status(400).json({error})})
})

router.delete('/books/:id', auth, (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: "not authorized"})
            } else {
                const filename = book.imageUrl.split('/image/')[1]
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'book deleted !'}))
                        .catch(error => res.status(400).json({ error }))
                })
            }
        })
    
})

export default router

