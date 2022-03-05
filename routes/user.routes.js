// External imports
const router = require("express").Router();
const bcrypt = require("bcryptjs");

// Internal imports
const User = require("../models/User.model")

const { isLoggedIn } = require('../middleware/route-guard.js');

const saltRounds = 10

// Get requests
router.get('/profile', isLoggedIn, (req, res, next) => {
  const {currentUser} = req.session;
  res.render('user/profile', { currentUser });
});

router.get('/settings', isLoggedIn, (req, res, next) => {
  const {currentUser} = req.session;
  res.render('user/settings', { currentUser });
  
});

// Post requests

router.post('/settings', (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  console.log(oldPassword, newPassword);
  const {currentUser} = req.session;
  User.findOne({ username: currentUser.username })
    .then(user => {
      console.log(user)
      console.log(oldPassword, user.password);
      if(bcrypt.compare(oldPassword, user.password)){
        User.updateOne(
          {username: user.username },
          {
            password: bcrypt.genSalt(saltRounds)
              .then(salt => bcrypt.hash(newPassword, salt))
              .catch(error =>console.log(error))
          }
        );
        res.render('user/settings', { currentUser, message: 'Password changed' });
      }
    })
    .catch(error => console.log(error));

})


module.exports = router;
