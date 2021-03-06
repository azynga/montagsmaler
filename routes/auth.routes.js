// External imports
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const session = require('express-session');

// Internal imports
const User = require('../models/User.model');
const { isLoggedIn } = require('../middleware/route-guard.js');

const saltRounds = 10;



// Get Routes
router.get('/signup', (req, res, next) => {
    res.render('auth/signup')
});

router.get('/login', isLoggedIn, (req, res, next) => {
    res.render('auth/login')
});



router.get('/logout', isLoggedIn, (req, res, next) => {
    const { currentUser } = req.session.currentUser;
    req.session.destroy();
    res.render('auth/logout', { currentUser });
});

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
            res.redirect('/')
        })
        .catch(error => console.log(`This error occured while creating user: ${error}`));

});

router.post('/login', (req, res, next) => {
    const { username, password } = req.body
    
    User.findOne({username})
        .then(user => {
            if(!user){

                return res.render('auth/login',  { errorMessage : 'Username/password incorrect or  user does not exist' });
            }
            else if(bcrypt.compareSync(password, user.password)){
                req.session.currentUser = user;
                return res.redirect('/');
            }
            else{
                return res.render('auth/login',  { errorMessage : 'Username/password incorrect or  user does not exist' });
            }
        })
        .catch(error => console.log('Error during user authentication', error));
        
});

// Exports
module.exports = router;