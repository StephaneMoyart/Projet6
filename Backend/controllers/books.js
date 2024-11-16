import fs from 'fs'

import Book from '../models/book.js'

export const list = (req, res) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }))
}

export const bestRatings = (req, res) => {
    Book.find()
        .sort({ averageRating: -1 })  
        .limit(3)
        .then(topBooks => {
            return res.status(200).json(topBooks)
        })
        .catch(error => {
            return res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des livres.' })
        })
}

export const getById = (req, res) => {
    Book.findById(req.params.id)
        .then(book => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }))
}

export const create = (req, res) => {
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
}

export const rateOne = (req, res) => {
    const userId = req.auth.userId;
    const grade  = req.body.rating
    
    Book.findById( req.params.id )
    .then( book => {
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const existingRating = book.ratings.find(rating => rating.userId === userId)

        if (existingRating) {
            return res.status(400).json({ message: 'User has already rated this book and cannot change their rating.' })
        }
        book.ratings.push({ userId, grade })

        const totalRatings = book.ratings.length
        const averageRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / totalRatings
        book.averageRating = averageRating

        book.save()
            .then(() => {
                return res.status(201).json(book)
            })
            .catch (error => {
                return res.status(400).json({ error })
            })
    })    
}

export const update = (req, res) => {
    const modBook = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete modBook._userId
    Book.findById( req.params.id )
        .then(book => {
            if(book.userId !== req.auth.userId) {
                res.status(401).json({message : "Not authorized"})
            } else {
                Book.findByIdAndUpdate(req.params.id, { ...modBook, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'book updated with success !'}))
                    .catch(error => res.status(400).json({ error }))
            }
        })
        .catch(error => {res.status(400).json({error})})
}

export const remove = (req, res) => {
    Book.findById( req.params.id )
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: "not authorized"})
            } else {
                const filename = book.imageUrl.split('/image/')[1]
                fs.unlink(`images/${filename}`, () => {
                    Book.findByIdAndDelete( req.params.id )
                        .then(() => res.status(200).json({ message: 'book deleted !'}))
                        .catch(error => res.status(400).json({ error }))
                })
            }
        })
    
}