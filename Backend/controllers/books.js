import fs from 'fs/promises'

import Book from '../models/book.js'

export const list = async (req, res) => {
    try {
        const books = await Book.find()
        res.status(200).json(books)
    } catch (error) {
        res.status(500).json({ error })
    }
}

export const bestRatings = async (req, res) => {
    try {
        const topBooks = await Book
            .find()
            .sort({ averageRating: -1 })  
            .limit(3)
        
        res.status(200).json(topBooks)
    } catch (error) {
        res.status(500).json({ error })
    }
}

export const getById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        res.status(200).json(book)
    } catch (error) {
        res.status(404).json({ error })
    }
}

export const create = async (req, res) => {
    try {

        const addedBook = JSON.parse(req.body.book)
        delete addedBook._id
        delete addedBook._userId
        
        addedBook.ratings = addedBook.ratings.filter(rating => rating.grade > 0 && rating.grade <= 5) 
        await Book.create({
            ...addedBook,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        })
    
        res.status(201).json({ message: 'book saved !'})
    } catch (error) {
        res.status(400).json({ error })
    }      
}

export const rateOne = async (req, res) => {
    try {
        const userId = req.auth.userId
        const grade  = req.body.rating ?? null
        
        if(grade === null || grade > 5 || grade < 0 ) return res.status(400).json({ message: 'Rating must be between 0 and 5' }) 

        const book = await Book.findById( req.params.id )
        if (!book) return res.status(404).json({ message: 'Book not found' })

        const existingRating = book.ratings.find(rating => rating.userId === userId)
        if (existingRating) return res.status(400).json({ message: 'User has already rated this book and cannot change their rating.' })

        book.ratings.push({ userId, grade })
        const totalRatings = book.ratings.length
        const averageRating = parseFloat((book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / totalRatings).toFixed(2))
        book.averageRating = averageRating

        await book.save()
        res.status(201).json(book)
    } catch (error) {
        res.status(400).json({ error })
    }
}

export const update = async (req, res) => {
    try {
        const bookId = req.params.id 

        const modBook = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body }

        delete modBook._userId

        const book = await Book.findById( bookId )
        if(!book) return res.status(404).json({ message : "not found"})
        if(book.userId !== req.auth.userId) return res.status(403).json({message : "unauthorized request"})
        
        await Book.findByIdAndUpdate(
            bookId, 
            { ...modBook, _id: bookId },
            { runValidators: true}
        )

        res.status(200).json({ message: 'book updated with success !'})

        if (req.file) {
            const filename = book.imageUrl.split('/images/')[1]
            try {
                await fs.unlink(`images/${filename}`) 
            } catch (unlinkError) {
                console.error(unlinkError)
            }
        }

    } catch (error) {        
        res.status(400).json({ error })
    }
}

export const remove = async (req, res) => {
    try {
        const book = await Book.findById( req.params.id )
        if (!book) return res.status(404).json({ message: 'Book not found' })

        if(book.userId !== req.auth.userId) return res.status(403).json({message : "unauthorized request"})
            
        await Book.findByIdAndDelete( req.params.id )
        res.status(200).json({ message: 'book deleted !'})

        const filename = book.imageUrl.split('/images/')[1]
        try {
            await fs.unlink(`images/${filename}`) 
        } catch (unlinkError) {
            console.error(unlinkError)
        }
        
    } catch (error) {
        res.status(500).json({ error })
    }
}