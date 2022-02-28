const router = require('express').Router();

router.get('/matchlist', (req, res) => {
    res.render('game/matchlist');
});

module.exports = router;