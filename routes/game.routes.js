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

        // console.log(req.session.currentUser)
    }
    // res.render('game/matchlist');
});

router.get('/create', (req, res) => {
    const userId = req.session.currentUser['_id'];
    const game = new Game();
    allGames[game.gameId] = game;
    res.redirect(`/game/${game.gameId}`);
});


router.get('/:gameId', (req, res) => {
    const { gameId } = req.params;
    
    if(!allGames[gameId]) {
        res.send('This game ID does not exist.');
        
    } else {
        const { currentUser } = req.session;
        const userId = currentUser['_id'];
        const game = allGames[gameId];
        game.addPlayer(userId);
        const players = game.players;
        res.render('game/game', { players, currentUser, gameId });
    };
});

router.get('/:gameId/leave', (req, res) => {
    const { gameId } = req.params;
    const userId = req.session.currentUser['_id'];
    const game = allGames[gameId];
    game.removePlayer(userId);
    res.redirect('/game/matchlist');
});


router.get('/:gameId/data', (req, res) => {
    const { gameId } = req.params;
    const userId = req.session.currentUser['_id'];
    const game = allGames[gameId];
    const players = game.players;
    const isPlayerDrawing = players[game.drawingPlayerIndex].userId === userId;
    const drawingData = allGames[gameId].currentDrawingData;

    const data = {
        drawingData,
        players,
        isPlayerDrawing
    }
    
    res.send(data);
    
});


router.post('/:gameId/data', (req, res) => {
    const drawingData = req.body;
    const { gameId } = req.params;
    const userId = req.session.currentUser['_id'];
    const game = allGames[gameId];
    game.currentDrawingData = drawingData;
    const players = game.players;
    const isPlayerDrawing = players[game.drawingPlayerIndex].userId === userId;

    const data = {
        players,
        isPlayerDrawing
    }
    res.send(data);
});

module.exports = router;