import express from 'express'
const router = express.Router()

import auth from '../middleware/auth.js'
import multer from '../middleware/multer-config.js'

import * as booksController from '../controllers/books.js'
import * as authController from '../controllers/auth.js'

router.get('/books', booksController.list)
router.get('/books/bestrating', booksController.bestRatings)
router.get('/books/:id', booksController.getById)

router.post('/auth/signup', authController.signUp)
router.post('/auth/login', authController.login)
router.post('/books', auth, multer, booksController.create)
router.post('/books/:id/rating', auth, multer, booksController.rateOne)

router.put('/books/:id', auth, multer, booksController.update)

router.delete('/books/:id', auth, booksController.remove)

export default router