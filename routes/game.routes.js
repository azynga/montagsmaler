// External imports
const router = require('express').Router();

// Internal imports
const { allGames, usersInGames, Game } = require('../game/game');
const User = require('../models/User.model');
const Drawing = require('../models/Drawing.model');
const { isLoggedIn } = require('../middleware/route-guard.js');


router.get('/matchlist', isLoggedIn, (req, res, next) => {
    if(req.session){
        const {currentUser} = req.session
        res.render('game/list', { allGames, currentUser });
    }
});

router.get('/create', (req, res) => {
    const { currentUser } = req.session;
    const userId = currentUser['_id'];

    if(!usersInGames[userId]) {
        const game = new Game();
        allGames[game.gameId] = game;
        res.redirect(`/game/${game.gameId}`);
    } else {
        res.send('Woops! Looks like you\'re already in a game. <a href="/game/matchlist">Back to list of games</a>');
    };
});

router.get('/:gameId', (req, res) => {
    const { gameId } = req.params;
    const game = allGames[gameId];
    const { currentUser } = req.session;
    const userId = currentUser['_id'];

    if(!game) {
        res.send('Woops! This game ID was not found. <a href="/game/matchlist">Back to list of games</a>');
    } else if(usersInGames[userId] && !game.players.some(player => player.userId === userId)) {
        res.send('Woops! Looks like you\'re already in a game. <a href="/game/matchlist">Back to list of games</a>');
    } else {
        game.addPlayer(userId);
        const players = game.players;
        res.render('game/game', { currentUser, gameId, players });
    };
});

router.post('/:gameId/drawing-store', (req, res) => {
    const { currentUser } = req.session;
    const userId = currentUser['_id'];
    const drawingInfo = req.body;
    Drawing.create(drawingInfo)
        .then(drawing => {
            console.log('Drawing stored in DB')
            return User.findByIdAndUpdate(userId, {
                $push: { drawings: drawing['_id'] }
            });
        })
        .then(user => {
            console.log('Drawing added to user: ' + user.username)
        })
        .catch(error => console.error(error));
});

module.exports = router;