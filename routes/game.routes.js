// External imports
const router = require('express').Router();

// Internal imports
const { isLoggedIn } = require('../middleware/route-guard.js');


const drawingData = {};

router.get('/matchlist', isLoggedIn, (req, res, next) => {
    if(req.session){
        const {currentUser} = req.session
        res.render('game/matchlist', { currentUser });
        // console.log(req.session.currentUser)
      }
    // res.render('game/matchlist');
});

router.get('/:gameId', (req, res) => {
    if(req.session){
        const {currentUser} = req.session
        res.render('game/game', { currentUser });
        // console.log(req.session.currentUser)
      }
    res.render('game/game');
});

router.get('/:gameId/data', (req, res) => {
    res.send(drawingData);
});

router.get(':gameId/lobby', (req, res) => {
    const { currentUser } = req.session;
    const { gameId } = req.params;
    const players = gameList[gameId].players;

    gameList[gameId].players.push(currentUser);
    res.render('games/lobby',{ currentUser }, { players });
});

router.post('/:gameId/data', (req, res) => {
    drawingData.lines = req.body.lines;
    res.end();
});

module.exports = router;