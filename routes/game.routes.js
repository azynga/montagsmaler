// External imports
const router = require('express').Router();

const { allGames, Game } = require('../game/game');
const User = require('../models/User.model');

// Internal imports
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
    
    if(!allGames[gameId]) {
        res.send('Woops! This game ID was not found. <a href="/game/matchlist">Back to list of games</a>');
        
    } else {
        const { currentUser } = req.session;
        const userId = currentUser['_id'];
        const game = allGames[gameId];

        game.connect(gameId, userId);
        res.render('game/game', { currentUser, gameId });
    };
});

module.exports = router;