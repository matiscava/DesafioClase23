const express = require('express');
const session = require('express-session');
const path = require('path');
const bCrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const {userDao} = require('./daos')
const users = new userDao;

const { redirect } = require('express/lib/response');
const req = require('express/lib/request');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('views','./../views');
app.set('view engine','ejs');
app.use(session({
    secret:'secretirijillo',
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 10000
    }
}))
app.use( passport.initialize() )
app.use( passport.session() )

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

/* PASSPORT */

passport.use('login',  new LocalStrategy(
    async (username , password , done ) => {
        const user = await users.findUser(username);
        if (!user) {
            console.log('User Not Found with username ',username);
            return done ( null , false )
        } 
        
        if ( !isValidPassword( user , password ) ) {
            console.log( 'Invalid Password' );
            return done ( null , false )
        }
        
        return done ( null , user )
        
    }
))

passport.use('signup', new LocalStrategy( 
    {
        passReqToCallback: true
    },
    async (req , username , email , done ) => {
        const user = await users.findUser(username);
        console.log('prueba en passport', user);
        if (user) {
            console.log('User already exists');
            return done( null , false )
        } 
        const newUser = {
            username: req.body.username,
            password: createHash(req.body.password),
            email: req.body.email
        }

        const idUser = await users.createUser(newUser)
        console.log('User register succesful iD ',idUser);
        req.session.idMongo = idUser;
        // res.redirect('/home');
        return done( null , idUser)
    }
) )

passport.serializeUser( ( user , done) => {
    console.log('prueba serialize user',user._id);
    done( null , user._id);
} )
passport.deserializeUser( async ( id , done ) => {
    console.log('prueba deserialize user',id);

        const user = await users.getById(id)
        // req.session.idMongo = user._id;
        console.log('probando deserialize', user._id);
        return done( null , user._id)
        // if (user) {
        //     done()
        // }
        // else
        // {
        //     console.log('error en deserializeUser');
        // }
    } )

/* ROUTES */

app.get( '/' , ( req , res ) => {
    res.redirect('/home');
})

app.get('/home', async ( req , res ) => {
    const idMongo = req.session && req.session.idMongo;
    const usuario = await users.getById(idMongo);
    
    console.log('probando usuario', usuario);
    res.render(path.join(process.cwd(), '/views/pages/home.ejs'), {usuario: usuario})

})
//Login
app.get( '/login' , async ( req , res ) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
    }else{

        const idMongo = req.session && req.session.idMongo;
        const usuario = await users.getById(idMongo);


        if (usuario) {
            res.redirect('/')

        } else {
            // res.render('./../views/pages/login.ejs')
            res.render(path.join(process.cwd(), '/views/pages/login.ejs'))
        }
    }
})
app.post( '/login' , passport.authenticate('login', {failureRedirect : '/faillogin' }) , async ( req , res ) => {
    const { username , password } = req.body;
    const user = await users.findUser(username);
    // if ( !user )
    // {
    //     console.log('User Not Found with username ',username);
    //     let problema = 'user error login: User not found';
    //     res.render(path.join(process.cwd(), '/views/pages/error.ejs'),{problema: problema, link: '/login'})
    // }
    // if ( !isValidPassword( user , password ) ) {
    //     console.log( 'Invalid Password' );
    //     let problema = 'user error login: invalid password';
    //     res.render(path.join(process.cwd(), '/views/pages/error.ejs'),{problema: problema, link: '/login'})
    // }
    req.session.idMongo = user._id;

    res.redirect('/home');

})
app.get( '/faillogin' , (req , res) => {
    res.render(path.join(process.cwd(), '/views/pages/faillogin.ejs'))
} )
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

    // const idMongo = req.session && req.session.idMongo;
    // const usuario = await users.getById(idMongo);

    // if (usuario) {
    //     res.redirect('/')
    // } else {
        // res.render('./../views/pages/login.ejs')
        res.render(path.join(process.cwd(), '/views/pages/signup.ejs'))
    // }
})
app.post( '/signup' , passport.authenticate( 'signup' , {failureRedirect: '/failsignup'} ) , async ( req , res ) => {
    // const { username , password , email } = req.body;
    // const oldUser = await users.findUser(username);
    // if (oldUser)
    // {
    //     console.log('User already exists');
    //     let problema = 'user error signup: user already exists';
    //     res.render(path.join(process.cwd(), '/views/pages/error.ejs'),{problema: problema, link: '/signup'})
    // }else{
    //     const newUser = {
    //         username: username,
    //         password: createHash(password),
    //         email: email
    //     }
    //     const idUser = await users.createUser(newUser)
    //     console.log('User register succesful iD ',idUser);
    //     req.session.idMongo = idUser;
    //     res.redirect('/home');
    // }
    const user = req.user;
    if ( user) res.redirect('/home')
    else {
        let problema = 'user error signup';
        res.render(path.join(process.cwd(), '/views/pages/error.ejs'),{problema: problema, link: '/signup'})
    }
})
app.get( '/failsignup' , (req , res) => {
    res.render(path.join(process.cwd(), '/views/pages/failsignup.ejs'))
} )
const PORT = process.env.port || 8050;

app.listen(PORT, ()=>{
    console.log(`El servidor se conecto al puerto: ${PORT}`);
})