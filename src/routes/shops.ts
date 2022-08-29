import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

const { PrismaClient } = require('@prisma/client');
const auth = require("../middleware/auth");
const express = require('express');
const prisma = new PrismaClient();
const router = express.Router();


router.get('/', auth, async(req: Request, res: Response) => {
    const shops = await prisma.shop.findMany();
    res.send({'shops': shops});
});

router.post('/', auth, async(req:Request, res: Response) => {
    const {name, address} = req.body;
    const exists = await prisma.shop.findUnique({
        where: {name: name}
    })

    if (exists) {
        return res.status(400).json({'detail': 'Shop with similar name exists'})
    }

    const shop = await prisma.shop.create({ data: {
        code: uuidv4(),
        name: req.body.name,
        address: req.body.address
    }});
    res.send(shop);
});

router.put('/:id', auth, async(req: Request, res: Response) => {
    let id = ~~req.params.id
    const exists = await prisma.shop.findUnique({
        where: {id: id}
    })

    if (!exists) {
        return res.json({'detail': 'Not found'})
    }

    const shop = await prisma.shop.update({
        where: {id: id}, data: req.body
    });

    res.send(shop);
})


module.exports = router;