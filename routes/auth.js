
const { name } = require('ejs');
var express = require('express');
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
var router = express.Router();
let { connection, db } = require('../database.js');
const { validate, linkSchema3 } = require('../validator/valid');



// affichage menu

router.get('/menu', function (req, res, next) {
    // render to views/user/add.ejs
    res.render('hoome', {
        // title: 'Login',
        // email: '',
        // password: ''     
    })
})



router.post('/register', validate(linkSchema3), async (req, res, next) => {

    const email = req.body.email;
    const name = req.body.name;
    let password = req.body.password;
    let username = req.body.username




    const salt = genSaltSync(10);
    password = hashSync(password, salt);
    user = await db.insertUser(name, email, password, username,)
        .then((result) => {
            req.session.user = result
            console.log(req.session)

            return res.sendStatus(200)
        })
        .catch((err) => {
            return res.sendStatus(400)
        })
});


//display login page
router.get('/', function (req, res, next) {
    // render to views/user/add.ejs
    res.render('login', {
        title: 'Login',
        email: '',
        password: ''
    })
})

// display login page
router.get('/login', function (req, res, next) {
    // render to views/user/add.ejs
    res.render('login', {
        title: 'Login',
        email: '',
        password: ''
    })
})


//authenticate user
router.post('/authentication', async function (req, res, next) {



    var email = req.body.email;
    var password = req.body.password;

    user = await db.getUserByEmail(email)
        .then((result) => {

            const isValidPassword = compareSync(password, result.password)

            if (isValidPassword) {
                result.password = undefined;
                req.session.loggedin = true;
                req.session.name = email;

                return res.redirect('/auth/home');
            }
            return res.sendStatus(400)



        })
        .catch((err) => {
            // res.redirect('/auth/login')
            return res.sendStatus(400)
        })


})


//display home page
router.get('/home', function (req, res, next) {
    if (req.session.loggedin) {

        res.render('home', {
            title: "Dashboard",
            name: req.session.name,
        });

    } else {

        req.flash('success', 'Please login first!');
        res.redirect('/auth/login');
    }
});

// Logout user
router.get('/logout', function (req, res) {
    req.session.destroy();

    res.redirect('/auth/login');
});

module.exports = router;