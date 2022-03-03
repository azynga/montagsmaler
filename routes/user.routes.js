const router = require("express").Router();

const { isLoggedIn } = require('../middleware/route-guard.js');

router.get('/myaccount', isLoggedIn, (req, res, next) => {
    if(req.session){
        const {currentUser} = req.session
        res.render('user/my-account', { currentUser });
        // console.log(req.session.currentUser)
      }
    // res.render('user/my-account')
});

module.exports = router;
