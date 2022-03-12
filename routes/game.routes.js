// External imports
const router = require('express').Router();

// Internal imports
const { allGames, Game } = require('../game/game');
const User = require('../models/User.model');
const { isLoggedIn } = require('../middleware/route-guard.js');


router.get('/matchlist', isLoggedIn, (req, res, next) => {
    if(req.session){
        const {currentUser} = req.session
        res.render('game/list', { allGames, currentUser });
    }
});

router.get('/create', (req, res) => {
    const game = new Game();
    allGames[game.gameId] = game;
    res.redirect(`/game/${game.gameId}`);
});


router.get('/:gameId', (req, res) => {
    const { gameId } = req.params;
    const game = allGames[gameId];

    if(!game) {
        res.send('Woops! This game ID was not found. <a href="/game/matchlist">Back to list of games</a>');
    } else {
        const { currentUser } = req.session;
        const userId = currentUser['_id'];
        game.addPlayer(userId);
        const players = game.players;
        res.render('game/game', { currentUser, gameId, players });
    };
});

// router.post('/:gameId/drawing', (req, res) => {
    // const { gameId } = req.params;
    // const drawing = req.body;
    // const userId = req.session.currentUser['_id'];
    // const game = allGames[gameId];
    // const players = game.players;
    // const isPlayerDrawing = players[game.drawingPlayerIndex].userId === userId;
    // if(isPlayerDrawing){
        //     players[game.drawingPlayerIndex].highlights.push({
            // url: canvas.toDataURL()
            // word: game.nextWords[0]
        // })
        // };
// })

module.exports = router;