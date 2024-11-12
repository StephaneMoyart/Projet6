import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    title: {type: String, required: true},
    author: String,
    imageUrl: {type: String, required: true},
    year: Number,
    genre: String,
    ratings: [
        {
            userId: {type: String, required: true},
            grade: {type: Number, required: true},
        },
    ],
    averageRating: {type: Number, default : 0},
})

export default  mongoose.model('book', bookSchema)