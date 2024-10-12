import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import apiRouter from './routes/api.js'

const app = express()
app.use(express.json())

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('^^Database connected^^'))


app.use('/api', apiRouter)

app.listen(3000, () => console.log('^^server started^^'))