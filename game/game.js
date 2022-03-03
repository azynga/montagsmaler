
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
        this.players.push({
            userId,
            points: 0
        });
    }

    removePlayer(userId) {
        delete this.players[userId];
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