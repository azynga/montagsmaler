const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get('/game', (req, res) => {
  res.render('game');
}); 

module.exports = router;
