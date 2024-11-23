import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../models/user.js'

export const signUp = async (req, res) => {
    try {
        const { password, email} = req.body

        if (!password || !email) return res.status(400).json({message : "Email/password are required"})
        
        const hashedPassword = await bcrypt.hash(password, 10)
        
        await User.create({
            email: req.body.email,
            password: hashedPassword
        })
        res.status(201).json({ message: 'user saved, welcome !'})
    } catch (error) {
        res.status(500).json({ error })
    }
}

export const login = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        if (!user) return res.status(401).json({message: "Wrong id or password"})

        const isValid = await bcrypt.compare(req.body.password, user.password)
        if(!isValid) return res.status(401).json({message: "Wrong id or password"})
        
        res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                {userId: user._id},
                process.env.JWT_SECRET,
                {expiresIn: '24h'}
            )
        })
    } catch (error) {
        res.status(500).json({ error })
    }
}