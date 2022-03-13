
const User = require('../models/User.model');
const Drawing = require('../models/User.model');
const wordsCollection = require('../data/words.json');

const wordsList = Object.keys(wordsCollection);
const allGames = {};
const usersInGames = {};

class Game {
    constructor() {
        this.gameId = Date.now().toString(36);
        this.players = [];
        this.roundTime = 120;
        this.timerId = null;
        this.activeRound = false;
    }

    addPlayer(userId) {
        if(!usersInGames[userId]) {
            usersInGames[userId] = true;
            User.findById(userId)
                .then(user => {
                    this.players.push({
                        username: user.username,
                        userId,
                        points: 0,
                        isReady: false
                    });
                    setTimeout(() => {
                        global.io.to(this.gameId).emit('playerlist change', this.players)
                        console.log('emit playerlist change')
                        console.log(this.players)
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
                console.log(this.players);
            }, 200);
        };
    }

    getRandomWord() {
        const randomIndex = Math.floor(Math.random() * wordsList.length);
        return wordsList[randomIndex];
    }

    playerIsReady(socketId) {
        const player = this.players.find(player => player.socketId === socketId);
        console.log(player);
        console.log(socketId);
        player.isReady = true;
        if(this.players.every(player => player.isReady)) {
            this.startRound();
        };
    }

    startRound() {
        this.activeRound = true;
        let secondsLeft = this.roundTime;
        this.timerId = setInterval(() => {
            secondsLeft -= 1;
            if(secondsLeft <= 0) {
                this.endRound();
            };
        }, 1000);

        this.nextWord();

        this.players.forEach((player, index) => {
            if(index === 0) {
                global.io.to(player.socketId).emit('is drawing player');
            } else {
                global.io.to(player.socketId).emit('is guessing player');
            };
            global.io.to(this.gameId).emit('start round');
        });
    }

    endRound() {
        this.activeRound = false;
        clearInterval(this.timerId);
        this.players.push(this.players.shift());
        global.io.to(this.gameId).emit('end round');
    }

    nextWord() {
        const nextWord = this.getRandomWord();
        global.io.to(this.gameId).emit('next word', nextWord);
    }

    correctGuess(socketId) {
        const guessingPlayer = this.players.find(player => player.socketId === socketId);
        const drawingPlayer = this.players[0];

        guessingPlayer.points += 1;
        drawingPlayer.points += 1;

        global.io.to(this.gameId).emit('playerlist change', this.players);
        this.nextWord();
    }
};

module.exports = {
    allGames,
    usersInGames,
    Game
};