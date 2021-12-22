const express = require('express');
const randomRoute = express.Router();
const { fork } = require('child_process');

const calcRandomNumbers = require('../utils/calcRandomNumbers')



randomRoute.get('/' , (req , res) => {
    let cantidad = req.query.cant;

    if (!cantidad || isNaN(cantidad)) {
        cantidad = 1000000000;
    }
    const objeto = fork('./src/utils/calcRandomNumbers')
    objeto.send(cantidad);
    objeto.on('message', numeros => {
        res.send(numeros)
    })

})

module.exports = randomRoute;