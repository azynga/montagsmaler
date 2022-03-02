const gameList = [];

class Game {
    constructor(userId) {
        this.gameId = Date.now().toString(32);
        this.players = [userId];
    }

    addPlayer(userId) {
        this.players.push(userId);
    }
};

module.exports = Game, gameList;