import jwt from 'jsonwebtoken'

const handleToken = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decodedToken.userId
        req.auth = {
            userId
        }
    next()
    } catch(error) {
        res.status(401).json({ error })
    }
}

export default handleToken