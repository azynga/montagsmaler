module.exports = (io) => {
    
    const { allGames } = require('./game');

    io.on('connection', socket => {
        
        socket.on('join game', (gameId) => {
          console.log('user connected');
          socket.join(gameId);
          const game = allGames[gameId];
          const players = game.players;
          const lastPlayerAdded = players[players.length-1];
          lastPlayerAdded.socketId = socket.id;
          const userId = lastPlayerAdded.userId;
      
          socket.to(gameId).emit('playerlist changed', players);
      
          socket.on('leave game', () => {
            game.removePlayer(userId);
            socket.to(gameId).emit('playerlist changed', players);
          });
      
          socket.on('drawing', (toPosition) => {
            console.log('server received the drawing data');
            socket.broadcast.to(gameId).emit('drawing update', toPosition);
          });
      
          socket.on('line stop', () => {
            socket.broadcast.to(game.gameId).emit('line stop');
            console.log(game.players);
            console.log(socket.id);
          });
      
        });
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        

    });

};