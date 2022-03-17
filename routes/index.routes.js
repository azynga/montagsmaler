// External imports
const router = require("express").Router();

// Internal imports
const Drawing = require('../models/Drawing.model');

/* GET home page */
router.get("/", (req, res, next) => {

  Drawing.find({isPublic: true}).sort({ updatedAt: -1})
  .populate('creator')
  .then(drawings => {
          if(req.session){
          const {currentUser} = req.session
        res.render('index', { currentUser, drawings });
      }
      else{
      
        res.render("index", drawings);
      }
      
    })
    .catch(error => console.error(error));
  // res.send(req.session)
});

module.exports = router;
