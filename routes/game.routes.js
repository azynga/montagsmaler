// External imports
const router = require('express').Router();

const { allGames, Game } = require('../game/game');
const User = require('../models/User.model');

// Internal imports
const { isLoggedIn } = require('../middleware/route-guard.js');

router.get('/matchlist', isLoggedIn, (req, res, next) => {
    if(req.session){
        const {currentUser} = req.session
        res.render('game/list', { currentUser });
        // console.log(req.session.currentUser)
      }
    // res.render('game/matchlist');
});

router.get('/create', (req, res) => {
    const userId = req.session.currentUser['_id'];
    const game = new Game();
    game.addPlayer(userId);
    allGames[game.gameId] = game;
    res.redirect('/game/:gameId');
});

router.get('/:gameId', (req, res) => {
    const {currentUser} = req.session;
    const { gameId } = req.params;
    const game = allGames.find((game) => game.gameId === gameId);
    const playerNames = game.players.map(player => {
        User.findById(player.userId)
            .then(playerName => playerName)
            .catch(error => console.error(error));
    });
    res.render('game/game', { players, currentUser });
});

router.get('/:gameId/data', (req, res) => {
    const { gameId } = req.params;
    const drawingData = allGames[gameId].currentDrawingData;
    res.send(drawingData);
});

// router.get(':gameId/lobby', (req, res) => {
//     const { currentUser } = req.session;
//     const { gameId } = req.params;
//     const players = gameList[gameId].players;
//     gameList[gameId].players.push(currentUser);
//     res.render('games/lobby', { players });
// });
//     gameList[gameId].players.push(currentUser);
//     res.render('games/lobby', { currentUser, players });
// });

router.post('/:gameId/data', (req, res) => {
    const { gameId } = req.params;
    const drawingData = allGames[gameId].currentDrawingData;
    drawingData.lines = req.body.lines;
    res.end();
});

module.exports = router;