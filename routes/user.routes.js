// External imports
const router = require("express").Router();
const bcrypt = require("bcryptjs");

// Internal imports
const User = require("../models/User.model");
const createAvatar = require('../avatar/avatar');

const { isLoggedIn } = require('../middleware/route-guard.js');
const async = require("hbs/lib/async");

const saltRounds = 10

// Get requests
router.get('/profile', isLoggedIn, (req, res, next) => {
  const { currentUser } = req.session;
  const userId = currentUser['_id']
  console.log(currentUser);
  User.findById(userId, { drawings: 1, '_id': 0 })
    .populate('drawings')
    .then(result => {
      const userDrawings = result.drawings;
      console.log(userDrawings)
      res.render('user/profile', { currentUser, userDrawings });
    })
    .catch(error => console.error(error));
});

router.get('/settings', isLoggedIn, (req, res, next) => {
  const avatarList = createAvatar();
  const { currentUser } = req.session;
  res.render('user/settings', { currentUser, avatarList });

});

// Post requests

router.post('/settings', (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  // const updatePassword =


  console.log(oldPassword, newPassword);
  const { currentUser } = req.session;
  const userId = currentUser['_id']
  // console.log('user id:',userId)
  User.findOne({ username: currentUser.username })
    .then(user => {
      // console.log(user)
      // console.log(oldPassword, user.password);
      if (!oldPassword || !newPassword) {
        res.render('user/settings', { currentUser, message: 'You have to fill both camps' });
      }
      else if (bcrypt.compareSync(oldPassword, user.password)) {
        // console.log('old password:', user.password)
        bcrypt.genSalt(saltRounds)
          .then(salt => bcrypt.hash(newPassword, salt))
          .then(hashed => {
            // console.log('New password:', hashed)
            User.updateOne({
              password: hashed
            })
              .then(response => {
                // console.log(response)
              })
              .catch(error => console.log(error))
          })
          .catch(error => console.log(error))
        // User.findOneAndUpdate( { 
        //   _id: userId
        // },
        // {
        //   password: bcrypt.genSalt(saltRounds)
        //   .then(salt => bcrypt.hash(newPassword, salt))
        //   .catch(error =>console.log(error))
        // },
        // {
        //   new: true,
        // }
        // )
        //   .then(updatePassword => console.log('old password:', user.password,'Updated password: ',updatePassword));
        res.render('user/settings', { currentUser, message: 'Password changed' });
      }
      else {
        res.render('user/settings', { currentUser, message: 'Passwords don\'t match' });
      }
    })
    .catch(error => console.log(error));

})


module.exports = router;
