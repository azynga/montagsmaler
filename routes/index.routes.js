const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  
if(req.session){
  const {currentUser} = req.session
  res.render('index', { currentUser });
  // console.log(req.session.currentUser)
}
else{

  res.render("index");
}
  // res.send(req.session)
});

module.exports = router;
