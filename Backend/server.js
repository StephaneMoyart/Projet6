import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import path from 'path'

import apiRouter from './routes/index.js'
import cors from './middleware/cors.js'

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

mongoose.connect(process.env.DATABASE_URL)
mongoose.connection
.on('error', (error) => console.error(error))
.once('open', () => console.log('^^Database connected^^'))

const app = express()
app
  .use(express.json())
  .use(cors)
  .use('/api', apiRouter)
  .use('/images', express.static(path.join(__dirname, 'images')))
  .listen(3000, () => console.log('^^server started^^'))