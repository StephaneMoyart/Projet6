import sharp from 'sharp'
import fs from 'fs'
import path from 'path'


const optimizeImage = (req, res, next) => {
    if (req.file) {
        const oldImagePath = path.join('images', req.file.filename)
        const newFileName = req.file.filename.replace(path.extname(req.file.filename), '.webp')
        const newImagePath = path.join('images', newFileName)
        console.log({ oldImagePath, newImagePath, ext: path.extname(req.file.filename) })
        
        sharp(oldImagePath)
            .resize(387, 568, { fit: 'cover' }) 
            .toFormat('webp') 
            .toFile(newImagePath) 
            .then(() => {
                req.file.filename = newFileName
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Error when deleting previous image', err)
                    } else {
                        console.log('Previous image deleted with success')
                    }
                })
                
                next()
            })
            .catch(error => {
                res.status(500).json(error)
            })
    }
    else next()
}

export default optimizeImage

