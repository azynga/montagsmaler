// External imports
const router = require("express").Router();
const bcrypt = require("bcryptjs");

// Internal imports
const User = require("../models/User.model");
const Drawing = require("../models/Drawing.model");

const { isLoggedIn } = require('../middleware/route-guard.js');
const async = require("hbs/lib/async");

const saltRounds = 10

// Get requests
router.get('/profile', isLoggedIn, (req, res, next) => {
  const { currentUser } = req.session;
  const userId = currentUser['_id']

  User.findById(userId, { drawings: 1, '_id': 0 })
    .populate('drawings')
    .then(result => {
      const userDrawings = result.drawings;
      
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

router.post('/profile/drawing/:drawingId/delete', (req, res, next) => {
  const { drawingId } = req.params;
  const { currentUser } = req.session;
  
  User.findOneAndUpdate({ username: currentUser.username}, { $pull: { drawings: drawingId }})
    .then(user => console.log('Drawing deleted from user'))
    .catch(error => console.log(error));
  Drawing.findByIdAndRemove(drawingId)
    .then(deletedDrawing => {
      
      res.redirect('/user/profile')
    })
    .catch(error => console.log(error));
});

router.post('/profile/drawing/:id/publish', (req, res, next) => {
const { id } = req.params;
Drawing.findByIdAndUpdate(id, { isPublic: true }, { new: true})
  .then(()=> res.redirect('/user/profile'))
  .catch(error => console.log('error when updating public status'));
});

router.post('/settings', (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  // const updatePassword =


  
  const { currentUser } = req.session;
  const userId = currentUser['_id']
  
  User.findOne({ username: currentUser.username })
    .then(user => {
      
      
      if (!oldPassword || !newPassword) {
        res.render('user/settings', { currentUser, message: 'You have to fill both camps' });
      }
      else if (bcrypt.compareSync(oldPassword, user.password)) {

        bcrypt.genSalt(saltRounds)
          .then(salt => bcrypt.hash(newPassword, salt))
          .then(hashed => {
    
            User.updateOne({
              password: hashed
            })
              .then(response => {
                
              })
              .catch(error => console.log(error))
          })
          .catch(error => console.log(error))
        
        res.render('user/settings', { currentUser, message: 'Password changed' });
      }
      else {
        res.render('user/settings', { currentUser, message: 'Passwords don\'t match' });
      }
    })
    .catch(error => console.log(error));

})


module.exports = router;
