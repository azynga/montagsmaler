const connect = (gameId, userId) => {

    const io = require('../server');

    io.on('connection', (socket) => {
        console.log(`connected to client ${userId} in room ${gameId}`);
        // console.log(socket.handshake.auth)

        socket.join(gameId);

        socket.on('hello', (number) => {
            console.log('received hello');

            socket.broadcast.to(gameId).emit('say hello', number, userId);
            console.log('emit sayhello to room');
        });

        socket.on('disconnect', () => {
            console.log(`client ${userId} disconnected from room ${gameId}`);
        })
    });
}

module.exports = connect;