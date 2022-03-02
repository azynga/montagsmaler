const router = require('express').Router();

const { Game, gameList } = require('../game/game');

const drawingData = {};

router.get('/matchlist', (req, res) => {
    res.render('game/matchlist');
});

router.get('/create', (req, res) => {
    const userId = req.session.currentUser['_id'];
    const game = new Game(userId);
    gameList.push(game);
};

router.get('/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    // gameList[gameId].resetRound();
    res.render('game');
});

router.get('/:gameId/data', (req, res) => {
    res.send(drawingData);
});

router.get(':gameId/lobby', (req, res) => {
    const { currentUser } = req.session;
    const { gameId } = req.params;
    const players = gameList[gameId].players;

    gameList[gameId].players.push(currentUser);
    res.render('games/lobby', { players });
});

router.post('/:gameId/data', (req, res) => {
    drawingData.lines = req.body.lines;
    res.end();
});

module.exports = router;