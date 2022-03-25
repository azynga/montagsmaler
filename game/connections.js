module.exports = (io) => {
    
    const { allGames } = require('./game');

    io.on('connection', socket => {
        
        socket.on('join game', (gameId, userId) => {
            console.log('user connected');
            
            const game = allGames[gameId];


            console.log(game.drawingData)
            console.log(game.drawingData[game.lineIndex])


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
    
          
                socket.on('leave game', (userId) => {
                    console.log('remove player')
                    game.removePlayer(userId);
                });
          
                socket.on('drawing', (toPosition, color, width) => {
                    console.log('server received the drawing data');
                    socket.broadcast.to(gameId).emit('drawing update', toPosition);

                    const currentLine = game.drawingData[game.lineIndex];
                    currentLine[0].color = color;
                    currentLine[0].width = width;
                    currentLine.push(toPosition);
                });
            
                socket.on('line stop', () => {
                    socket.broadcast.to(game.gameId).emit('line stop');
                    const nextLine = [{}];
                    game.drawingData.push(nextLine);
                    game.lineIndex += 1;
                });

                socket.on('change line style', (color, width) => {
                    socket.broadcast.to(game.gameId).emit('change line style', color, width);
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