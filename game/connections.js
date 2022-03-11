
const connect = (gameId, userId) => {
    
    const { allGames } = require('./game');
    const User = require('../models/User.model');
    const io = require('../server');


    io.on('connection', socket => {
        
        const game = allGames[gameId];
        
        socket.join(gameId);
        
        game.addPlayer(userId);
        
        console.log('user connected');

        // socket.on('hello', () => {
        //     console.log('received hello');

        //     socket.broadcast.to(gameId).emit('sayhello', userId);
        //     // console.log('emit sayhello to room');
        // });

        // console.log(socket)
        socket.on('drawing', (toPosition) => {
            console.log('server received the drawing data');
    
            socket.broadcast.to(gameId).emit('drawing update', toPosition);
            console.log('server sending the drawing update');
        });
    
        socket.on('line stop', () => {
            socket.broadcast.to(gameId).emit('line stop')
        });
    
        socket.on('disconnect', () => {
            console.log('user disconnected');

            game.removePlayer(userId);
            if(game.players.length <= 0) {
                delete allGames[gameId];
            };

        });
    });

};


//     io.on('connection', (socket) => {
//         console.log(`connected to client ${userId} in room ${gameId}`);
//         const game = allGames[gameId];
        
//         game.addPlayer(userId);

//         socket.join(gameId);

        


//         socket.on('disconnect', () => {
//             console.log(`client ${userId} disconnected from room ${gameId}`);
//             game.removePlayer(userId);
//             if(game.players.length <= 0) {
//                 delete allGames[gameId];
//             };
//         });
//     });
// }

module.exports = connect;