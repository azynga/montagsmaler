module.exports = (gameId) => {
    
    const { allGames } = require('./game');
    const io = require('../server');

    io.on('connection', socket => {
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        const game = allGames[gameId];
        
        if(game) {
            socket.join(gameId);
            console.log('user connected');
            console.log(io.sockets.adapter.rooms.entries());
            
            socket.on('drawing', (toPosition) => {
                console.log('server received the drawing data');
                socket.broadcast.to(gameId).emit('drawing update', toPosition);
            });
        
            socket.on('line stop', () => {
                socket.broadcast.to(gameId).emit('line stop')
            });
        
        } else {
            socket.disconnect();
            console.log('server forced disconnect. game does not exist.')
        };
        
    });

};