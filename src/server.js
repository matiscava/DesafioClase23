const express = require('express');
const session = require('express-session');
const path = require('path');
const bCrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const { Router } = express; 
const router = Router();

const {usersDao} = require('./daos')
const {productsDao} = require('./daos')

const randomRoute = require('./routes/randomRoute')

const Products = new productsDao;
const Users = new usersDao;

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
        maxAge: 600000
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
        const user = await Users.findUser(username);
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
        const user = await Users.findUser(username);
        if (user) {
            console.log('User already exists');
            return done( null , false )
        } 
        const newUser = {
            username: req.body.username,
            password: createHash(req.body.password),
            email: req.body.email
        }

        const idUser = await Users.createUser(newUser)
        console.log('User register succesful iD ',idUser);
        req.session.idMongo = idUser;

        return done( null , idUser)
    }
) )


passport.serializeUser( ( user , done) => {
    done( null , user._id);
} )
passport.deserializeUser( async ( id , done ) => {

        const user = await Users.getById(id)

        return done( null , user._id)

    } )

/* ROUTES */

app.get( '/' , ( req , res ) => {
    res.redirect('/home');
})

app.get('/home', async ( req , res ) => {
    const idMongo = req.session && req.session.idMongo;
    console.log('prueba',idMongo);
    const usuario = await Users.getById(idMongo);
    const productsList = await Products.getAll();

    if(usuario) req.session.idMongo = usuario._id;
    res.render(path.join(process.cwd(), '/views/pages/home.ejs'), {usuario: usuario, productsList: productsList})

})
app.post( '/home', async( req , res ) => {
    const idMongo = req.session && req.session.idMongo;

    const user = req.user;

    console.log('prueba post',idMongo);
    console.log('prueba post dos',user);

    const newProduct = req.body;
    const productId = await Products.createProduct(newProduct)
    console.log(productId);
    const message = {
        message: 'Se ha cargado un nuevo producto',
        data: productId
    };
    console.log(message);
    res.redirect('/')
})

//INFO

app.get( '/info' , ( req , res) => {
    const info = {
        in:process.argv,
        platform: process.platform,
        version: process.version,
        memory: process.memoryUsage().rss,
        pathexec: process.execPath,
        processId: process.pid,
        folder: process.cwd()
    }

    res.render(path.join(process.cwd(), '/views/pages/info.ejs'), {info: info})

})

//Login
app.get( '/login' , async ( req , res ) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
    }else{

        const idMongo = req.session && req.session.idMongo;
        const usuario = await Users.getById(idMongo);


        if (usuario) {
            res.redirect('/')

        } else {
            res.render(path.join(process.cwd(), '/views/pages/login.ejs'))
        }
    }
})
app.post( '/login' , passport.authenticate('login', {failureRedirect : '/faillogin' }) , async ( req , res ) => {
    const { username , password } = req.body;
    const user = await Users.findUser(username);

    req.session.idMongo = user._id;

    res.redirect('/home');

})
app.get( '/faillogin' , (req , res) => {
    res.render(path.join(process.cwd(), '/views/pages/faillogin.ejs'))
} )
//logout
app.get('/logout', async ( req , res ) => {
    const idMongo = req.session && req.session.idMongo;
    const usuario = await Users.getById(idMongo);

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
    res.render(path.join(process.cwd(), '/views/pages/signup.ejs'))
 
})
app.post( '/signup' , passport.authenticate( 'signup' , {failureRedirect: '/failsignup'} ) , async ( req , res ) => {
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

app.use('/api/randoms', randomRoute)

const PORT = process.env.port || 8050;

app.listen(PORT, ()=>{
    console.log(`El servidor se conecto al puerto: ${PORT}`);
})