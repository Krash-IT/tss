import { Request, Response } from "express";

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt')
const express = require('express');
const jwt = require('jsonwebtoken')
const prisma = new PrismaClient();
const router = express.Router();


router.post('/register', async (req: Request, res: Response) => {
    const { email, password, first_name, last_name } = req.body
    const hash = bcrypt.hashSync(password, 10);
    const exists = await prisma.user.findUnique({
        where: {email: email.toLowerCase()}
    })

    if (exists) {
        return res.json({'detail': 'An account with this email exists'})
    }

    try{
        const user = await prisma.user.create({ data: {
            email: email.toLowerCase(), password: hash,
            first_name, last_name,
        }}); 

        const token = jwt.sign(
            {user_id: user.id, email}, process.env.TOKEN_KEY, {expiresIn: "2h"}
        )

        let data = {
            email: user.email, first_name: user.first_name,
            last_name: user.last_name, token: token
        }
        res.send(data)
    } catch(error) {
        res.send(error)
    }
})

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({
        where: {email: email.toLowerCase()}
    })
    if (!user) {
        res.send({"detail": "User with this email does not exist."})
        return
    }
    if (user) {
        const hash = user.password
        const result = bcrypt.compareSync(req.body.password, hash);
        if (!result) {
            res.send({"detail": "Cannot login with the given credentials."})
            return
        } else {
            const token = jwt.sign({user_id: user.id, email}, process.env.TOKEN_KEY, {expiresIn: "2h"}) 
            await prisma.user.update({where: {email: user.email}, data: {token: token}})            

            res.send({
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                token: token
            })
        }
    };
})

module.exports = router;