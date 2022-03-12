module.exports = (gameId, userId) => {
    
    const { allGames } = require('./game');
    const io = require('../server');

    io.on('connection', socket => {
        
        const game = allGames[gameId];
        // const player = game.players.find(player => player.userId === userId);
        
        // player.socketId = socket.id;

        // socket.to(gameId).emit('playerlist changed', game.players);
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
            game.removePlayer(userId);
            // socket.to(gameId).emit('playerlist changed', game.players);
        });
        
        if(game) {
            socket.join(gameId);
            console.log('user connected');
            // console.log(io.sockets.adapter.rooms);
            
            socket.on('drawing', (toPosition) => {
                console.log('server received the drawing data');
                socket.broadcast.to(gameId).emit('drawing update', toPosition);
            });
        
            socket.on('line stop', () => {
                socket.broadcast.to(gameId).emit('line stop');
                console.log(game.players);
                console.log(socket.id);
            });
        
        } else {
            socket.disconnect();
            console.log('server forced disconnect. game does not exist.')
        };
        
    });

};