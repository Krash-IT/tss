import { Request, Response } from "express";

const { PrismaClient } = require('@prisma/client');
const auth = require("../middleware/auth");
const express = require('express');
const prisma = new PrismaClient();
const router = express.Router();


router.get('/', auth, async(req: Request, res: Response) => {
    const products = await prisma.product.findMany();
    res.send({'products': products});
})

router.post('/', auth, async(req: Request, res: Response) => {
    const exists = await prisma.product.findUnique({
        where: {name: req.body.name}
    })

    if (exists) {
        return res.status(400).json({'detail': 'Shop with similar name exists'})
    }

    const product = await prisma.product.create({ data: req.body });
    res.send(product);
})

module.exports = router;