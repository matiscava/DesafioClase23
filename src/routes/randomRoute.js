const express = require('express');
const randomRoute = express.Router();
const { fork } = require('child_process');

const calcRandomNumbers = require('../utils/calcRandomNumbers')



randomRoute.get('/' , (req , res) => {
    let cantidad = req.query.cant;

    if (!cantidad || isNaN(cantidad)) {
        cantidad = 1000000000;
    }
    console.log(cantidad);
    const objeto = fork('./../utils/calcRandomNumbers')
    objeto.send('Inicio del conteo...');
    objeto.on('message', numeros => {
        res.json(numeros)
    })

    res.json(objeto);
})

module.exports = randomRoute;