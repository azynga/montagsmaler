
const User = require('../models/User.model');
const wordsCollection = require('../data/words.json');

const wordsList = Object.keys(wordsCollection);
const allGames = {};
const usersInGames = {};

class Game {
    constructor() {
        this.gameId = Date.now().toString(36);
        this.players = [];
        this.roundTime = 120;
        this.secondsLeft = this.roundTime;
        this.rounds = 2;
        this.currentRound = 0;
        this.timerId = null;
        this.inProgress = false;
        this.drawingData = [[]];
        this.lineIndex = 0;
        this.currentWord = null;
        this.activeRound = false;
    }

    addPlayer(userId) {
        if(!usersInGames[userId]) {
            usersInGames[userId] = this.gameId;
            User.findById(userId)
                .then(user => {
                    this.players.push({
                        username: user.username,
                        userId,
                        points: 0,
                        isReady: false,
                        drawingRoundsCount: 0
                    });
                    setTimeout(() => {
                        global.io.to(this.gameId).emit('playerlist change', this.players);
                    }, 200);
                }); 
        };
    }

    removePlayer(userId) {
        this.players = this.players.filter(player => player.userId !== userId);
        delete usersInGames[userId];
        if(this.players.length <= 0) {
            delete allGames[this.gameId];
        } else {
            setTimeout(() => {
                global.io.to(this.gameId).emit('playerlist change', this.players);
                console.log('emit playerlist change');
            }, 200);
        };
    }

    endGame(players) {
        global.io.to(this.gameId).emit('end game', players);
        this.nextWord();
        this.resetGame();
    }

    getRandomWord() {
        const randomIndex = Math.floor(Math.random() * wordsList.length);
        return wordsList[randomIndex];
    }

    playerIsReady(socketId) {
        const player = this.players.find(player => player.socketId === socketId);
        player.isReady = true;
        if(this.players.length > 1 && this.players.every(player => player.isReady) && !this.activeRound) {
            this.startRound();
        };
        global.io.to(this.gameId).emit('playerlist change', this.players);
    }

    startRound() {
        this.inProgress = true;
        this.activeRound = true;

        const drawingPlayer = this.players[0];
        drawingPlayer.drawingRoundsCount += 1;
        this.secondsLeft = this.roundTime;

        // setTimeout(() => {
            global.io.emit('tick', this.secondsLeft);
    
            this.timerId = setInterval(() => {
                this.secondsLeft -= 1;
                global.io.emit('tick', this.secondsLeft);
                if(this.secondsLeft <= 0) {
                    this.endRound();
                };
            }, 1000);
    
            this.nextWord();
    
            this.currentRound += 1;

            this.players.forEach(player => player.isReady = false);
    
            global.io.to(this.gameId).emit('start round', drawingPlayer.userId);

        // }, 2000);

    }

    endRound() {
        clearInterval(this.timerId);
        this.activeRound = false;
        this.players.push(this.players.shift());
        if(this.players.every(player => player.drawingRoundsCount === this.rounds)) {
            this.inProgress = false;
            this.endGame(this.players);
        };
        global.io.to(this.gameId).emit('end round');
    }

    nextWord() {
        this.drawingData = [[]];
        this.lineIndex = 0;
        this.currentWord = this.getRandomWord();
        global.io.to(this.gameId).emit('next word', this.currentWord, this.currentRound);
    }

    correctGuess(socketId) {
        const guessingPlayer = this.players.find(player => player.socketId === socketId);
        const drawingPlayer = this.players[0];

        guessingPlayer.points += 1;
        drawingPlayer.points += 1;

        global.io.to(this.gameId).emit('playerlist change', this.players);
        this.nextWord();
    }

    resetGame() {
        this.players.forEach(player => {
            player.points = 0;
            player.isReady = false;
            player.drawingRoundsCount= 0;
        });
        this.secondsLeft = this.roundTime;
        this.currentRound = 0;
        this.inProgress = false;
        this.drawingData = [[]];
        this.lineIndex = 0;
        this.currentWord = null;
        this.activeRound = false;
        global.io.to(this.gameId).emit('playerlist change', this.players);
    }
};

module.exports = {
    allGames,
    usersInGames,
    Game
};