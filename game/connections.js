module.exports = (io) => {
    
    const { allGames } = require('./game');
    const Drawing = require('../models/User.model');


    io.on('connection', socket => {
        
        socket.on('join game', (gameId, userId) => {
            console.log('user connected');
            socket.join(gameId);

            const game = allGames[gameId];
            const players = game.players;
            const connectedPlayer = players.find(player => player.userId === userId);
            if(connectedPlayer.socketId) {
                socket.emit('reconnect', game);
            };
            connectedPlayer.socketId = socket.id;

      
            socket.on('leave game', () => {
                game.removePlayer(userId);
            });
      
            socket.on('drawing', (toPosition) => {
                console.log('server received the drawing data');
                socket.broadcast.to(gameId).emit('drawing update', toPosition);
                const currentLine = game.drawingData[game.lineIndex];
                currentLine.push(toPosition);
            });
        
            socket.on('line stop', () => {
                socket.broadcast.to(game.gameId).emit('line stop');
                game.drawingData.push([]);
                game.lineIndex += 1;
                console.log(game.players);
                console.log(socket.id);
                console.log(game.drawingData)
            });

            socket.on('player ready', () => {
                game.playerIsReady(socket.id);
            });

            socket.on('correct guess', () => {
                game.correctGuess(socket.id);
            });

        });
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

    });

};