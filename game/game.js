
const User = require('../models/User.model');

const allGames = {};

class Game {
    constructor() {
        this.gameId = Date.now().toString(36);
        this.players = [];
        this.currentDrawingData = {};
        this.roundTimeLeft = 120;
        this.drawingPlayerIndex = 0;
        this.timer = null;
        this.activeRound = false;
        this.nextWords = [];
    }

    addPlayer(userId) {
        const playerAlreadyInGame = this.players.some(player => player.userId === userId);
        if(!playerAlreadyInGame) {
            User.findById(userId)
                .then(user => {
                    this.players.push({
                        username: user.username,
                        userId,
                        points: 0
                    });
                });
        };
    }

    removePlayer(userId) {
        this.players = this.players.filter(player => player.userId !== userId);
    }

    getRandomWord() {
        return 'placeholder'
    }

    getFirstWords() {
        const words = []
        for(let i = 0; i < 3; i ++) {
            this.getRandomWord()
                .them(randomWord => {
                    this.words.push(randomWord)
                })
                .catch(error => console.error(error));
        };
        return words;
    }

    nextWord() {
        this.nextWords.shift();
        getRandomWord()
            .then(randomWord => this.nextWords.push(randomWord))
            .catch(error => console.error(error));
    }

    startRound() {
        this.activeRound = true;
        this.timer = setInterval(() => {
            this.roundTimeLeft -= 1;
            if(this.roundTimeLeft <= 0) {
                endRound();
            };
        }, 1000);
    }

    endRound() {
        this.activeRound = false;
        clearInterval(this.timer);
        const playerCount = this.playerDrawing.length;
        this.playerDrawing = (this.playerDrawing + 1) % playerCount;
        this.currentDrawingData = {};
    }
};

module.exports = {
    allGames,
    Game
};