import mongoose from 'mongose'

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
    averageRating: Number,
})

const model = mongoose.model('book', bookSchema)
export default model