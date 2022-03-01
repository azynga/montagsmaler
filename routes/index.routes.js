const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
if(req.session){
  // console.log(req.session.currentUser)
}
  res.render("index");
  // res.send(req.session)
});

module.exports = router;
