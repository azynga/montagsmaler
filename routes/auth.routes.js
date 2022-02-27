// External imports
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const session = require('express-session');

// Internal imports
const User = require('../models/User.model');

const saltRounds = 10;

// Get Routes
router.get('/signup', (req, res) => res.render('auth/signup'));

router.get('/login', (req, res) => res.render('auth/login'));

// Post Routes

router.post('/signup', (req, res, next) => {
    const { username, password, email } = req.body;
    bcrypt.genSalt(saltRounds)
        .then(salt => bcrypt.hash(password, salt))
        .then(hashed => {
            User.create({
                username,
                password: hashed,
                email
            });
            res.render('/')
        })
        .catch(error => console.log(`This error occured while creating user: ${error}`));

});

router.post('/login', (req, res, next) => {
    console.log(req.session)
});

// Exports
module.exports = router;