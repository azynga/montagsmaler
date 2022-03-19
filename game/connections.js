module.exports = (io) => {
    
    const { allGames } = require('./game');

    io.on('connection', socket => {
        
        socket.on('join game', (gameId, userId) => {
            console.log('user connected');
            
            const game = allGames[gameId];

            if(game) {
                socket.join(gameId);
    
                const players = game.players;
                const connectedPlayer = players.find(player => player.userId === userId);

                if(connectedPlayer.socketId) {
                    const drawingPlayerId = players[0].userId; 

                    const {
                        drawingData,
                        currentWord,
                        secondsLeft,
                        activeRound
                    } = game;

                    const gameData = {
                        drawingData,
                        currentWord,
                        secondsLeft,
                        activeRound,
                        drawingPlayerId
                    };

                    socket.emit('reconnect', gameData);
                }
            
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
                });
    
                socket.on('player ready', () => {
                    game.playerIsReady(socket.id);
                });
    
                socket.on('correct guess', () => {
                    game.correctGuess(socket.id);
                });

                socket.on('skip', () => {
                    console.log('received skip')
                    const player = game.players.find(player => player.userId === userId);
                    player.points -= 1;
                    global.io.emit('playerlist change', players)
                    game.nextWord();
                });
            } else {
                console.log('Forced disconnect. Game does not exist.')
                socket.disconnect();
            }

        });
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

    });

};