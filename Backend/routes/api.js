import express from 'express'
const router = express.Router()

router.get('/books', (req, res) => {
        res.send("okokok")
})
router.get('/books/:id', (res, req) => {})
router.get('/books/bestrating', (res, req) => {})
router.post('/auth/signup', (req, res) => {})
router.post('/auth/login', (req, res) => {})
router.post('/books', (req, res) => {})
router.post('/books/:id/rating', (req, res) => {})
router.put('books/:id', (res, req) => {})
router.delete('books/:id', (req, res) => {})

export default router