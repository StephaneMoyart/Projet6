import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../models/user.js'

export const signUp = (req, res) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })
            user.save()
                .then(() => res.status(201).json({ message: 'user saved, welcome !'}))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}

export const login = (req, res) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (user === null) res.status(401).json({message: "Idantifiant/mot de passe inccorects"})
            else bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if(!valid) res.status(401).json({mesage: "Idantifiants/mot de passe incorrects"})
                    else res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            process.env.JWT_SECRET,
                            {expiresIn: '24h'}
                        )
                    })
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}