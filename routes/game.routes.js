const router = require('express').Router();

const drawingData = {};

router.get('/matchlist', (req, res) => {
    res.render('game/matchlist');
});

router.get('/:gameId', (req, res) => {
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