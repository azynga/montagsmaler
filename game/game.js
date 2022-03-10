
const axios = require('axios');

const User = require('../models/User.model');
const connect = require('./connections');
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
        this.nextWords = this.getFirstWords();
        this.connect = connect;
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
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const letterIndex = Math.floor(Math.random() * 26);
        const randomLetter = alphabet[letterIndex];

        return axios.get(`https://api.datamuse.com/words?sp=*${randomLetter}*&md=pf&max=1000`)
            .then(response => {
                const wordList = response.data;
                const filteredWordList = wordList.filter(wordData => {
                    const wordFrequency = Number(wordData.tags.find(item => item.startsWith('f:')).slice(2));
                    return wordData.tags.includes('n') && wordFrequency > 10 && wordData.word.length > 2;
                });
                const wordIndex = Math.floor(Math.random() * filteredWordList.length);
                const randomWord = filteredWordList[wordIndex];
                return randomWord.word;
            })
            .catch(error => console.error(error));
    }

    getFirstWords() {
        const words = []
        for(let i = 0; i < 3; i ++) {
            this.getRandomWord()
                .then(randomWord => {
                    words.push(randomWord);
                })
                .catch(error => console.error(error));
        };
        return words;
    }

    nextWord() {
        this.currentDrawingData = {};
        this.nextWords.shift();
        this.getRandomWord()
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
        const playerCount = this.players.length;
        this.drawingPlayerIndex = (this.drawingPlayerIndex + 1) % playerCount;
    }

    correctGuess(userId) {
        const guessingPlayer = this.players.find(player => player.userId === userId);
        const drawingPlayer = this.players[this.drawingPlayerIndex];

        guessingPlayer.points += 1;
        drawingPlayer.points += 1;

        this.currentDrawingData = {};
        this.nextWord();
    }
};

module.exports = {
    allGames,
    Game
};