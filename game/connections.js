
const connect = (gameId, userId) => {
    
    const { allGames } = require('./game');
    const User = require('../models/User.model');
    const io = require('../server');

    io.on('connection', (socket) => {
        console.log(`connected to client ${userId} in room ${gameId}`);
        const game = allGames[gameId];
        
        game.addPlayer(userId);

        socket.join(gameId);

        

        // socket.on('hello', () => {
        //     console.log('received hello');

        //     socket.broadcast.to(gameId).emit('sayhello', userId);
        //     console.log('emit sayhello to room');
        // });

        socket.on('disconnect', () => {
            console.log(`client ${userId} disconnected from room ${gameId}`);
            game.removePlayer(userId);
            if(game.players.length <= 0) {
                delete allGames[gameId];
            };
        });
    });
}

module.exports = connect;

// const connect = () => {

//     const io = require('../server');

//     io.on('connection', (socket) => {
//         console.log("connected here")

//         // socket.join(gameId);

//         socket.on('hello', (number) => {
//             console.log('received hello');

//             socket.broadcast.emit('say hello', userId);
//             console.log('emit sayhello to room');
//         });

//         socket.on('disconnect', () => {
//             console.log(`client ${userId} disconnected from room ${gameId}`);
//         })
//     });
// }

// module.exports = connect;