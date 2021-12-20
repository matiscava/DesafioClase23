const express = require('express');
const session = require('express-session');
const path = require('path');
const bCrypt = require('bcrypt');

const {userDao} = require('./daos')
const users = new userDao;

const { redirect } = require('express/lib/response');
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


/* FUNCIONES */
function createHash(password) {
    return bCrypt.hashSync(
        password,
        bCrypt.genSaltSync(10),
        null
    );
}
function isValidPassword( user , password ) {
    return bCrypt.compareSync( password , user.password )
}


app.get( '/' , ( req , res ) => {
    res.redirect('/home');
})

app.get('/home', async ( req , res ) => {
    const idMongo = req.session && req.session.idMongo;
    const usuario = await users.getById(idMongo);

    res.render(path.join(process.cwd(), '/views/pages/home.ejs'), {usuario: usuario})

    // res.send('probando')
})
//Login
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
app.post( '/login' , async ( req , res ) => {
    const { username , password } = req.body;
    const user = await users.findUser(username);
    if ( !user )
    {
        console.log('User Not Found with username ',username);
        let problema = 'user error login: User not found';
        res.render(path.join(process.cwd(), '/views/pages/error.ejs'),{problema: problema, link: '/login'})
    }
    if ( !isValidPassword( user , password ) ) {
        console.log( 'Invalid Password' );
        let problema = 'user error login: invalid password';
        res.render(path.join(process.cwd(), '/views/pages/error.ejs'),{problema: problema, link: '/login'})
    }
    req.session.idMongo = user._id;

    res.redirect('/home');

})
//logout
app.get('/logout', async ( req , res ) => {
    const idMongo = req.session && req.session.idMongo;
    const usuario = await users.getById(idMongo);

    if (usuario) {
        req.session.destroy(error => {
            if (!error) {
                res.render(path.join(process.cwd(), '/views/pages/logout.ejs'), { nombre: usuario})
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect('/')
    }
})


//signup

app.get( '/signup' , async ( req , res ) => {

    const idMongo = req.session && req.session.idMongo;
    const usuario = await users.getById(idMongo);

    if (usuario) {
        res.redirect('/')
    } else {
        // res.render('./../views/pages/login.ejs')
        res.render(path.join(process.cwd(), '/views/pages/signup.ejs'))
    }
})
app.post( '/signup' , async ( req , res ) => {
    const { username , password , email } = req.body;
    const oldUser = await users.findUser(username);
    if (oldUser)
    {
        console.log('User already exists');
        let problema = 'user error signup: user already exists';
        res.render(path.join(process.cwd(), '/views/pages/error.ejs'),{problema: problema, link: '/signup'})
    }else{
        const newUser = {
            username: username,
            password: createHash(password),
            email: email
        }
        const idUser = await users.createUser(newUser)
        console.log('User register succesful iD ',idUser);
        req.session.idMongo = idUser;
        res.redirect('/home');
    }
})

const PORT = process.env.port || 8050;

app.listen(PORT, ()=>{
    console.log(`El servidor se conecto al puerto: ${PORT}`);
})