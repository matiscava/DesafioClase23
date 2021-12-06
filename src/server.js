const express = require('express');
const session = require('express-session');
const {userDao} = require('./daos')

const users = new userDao;

const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('views','./../views');
app.set('view engine','ejs');
app.use(session({
    secret:'secretirijillo',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 6000
    }
}))

app.get( '/' , ( req , res ) => {
    res.redirect('/home');
})

app.get('/home', async ( req , res ) => {
    const idMongo = req.session && req.session.idMongo;
    const usuario = await users.getById(idMongo);
    // let nombre = req.session && req.session.nombre;
    // if (nombre===undefined) nombre=false;
    // res.render('./../views/pages/home.ejs', {nombre: nombre})
    res.render(path.join(process.cwd(), '/views/pages/home.ejs'), {nombre: usuario})

    // res.send('probando')
})

app.get( '/login' , async ( req , res ) => {

    const idMongo = req.session && req.session.idMongo;
    const usuario = await users.getById(idMongo);

    if (usuario) {
        res.redirect('/')
    } else {
        // res.render('./../views/pages/login.ejs')
        res.render(path.join(process.cwd(), '/views/pages/login.ejs'))
    }
})
app.get('/logout', async ( req , res ) => {
    const idMongo = req.session && req.session.idMongo;
    const usuario = await users.getById(idMongo);

    if (usuario) {
        req.session.destroy(error => {
            if (!error) {
                users.deleteById(idMongo)
                res.render(path.join(process.cwd(), '/views/pages/logout.ejs'), { nombre: usuario})
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect('/')
    }
})

app.post( '/login' , async ( req , res ) => {
    const userName = req.body.nombre;
    const idUser = await users.createUser(userName)
    req.session.idMongo = idUser;
    res.redirect('/home');

})

const PORT = process.env.port || 8050;

app.listen(PORT, ()=>{
    console.log(`El servidor se conecto al puerto: ${PORT}`);
})