// Set up canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const playerList = document.getElementById('player-list');
const currentWordDisplay = document.getElementById('current-word');
const leaveGame = document.getElementById('leave-game');
const gameId = window.location.pathname.slice(6);

console.log(gameId)

canvas.width = 600;
canvas.height = 600;

const socket = io();

let lastPosition = null;
let penDown = false;
// let isDrawingPlayer = false;


// socket.emit('join game', gameId);

ctx.strokeStyle = 'hsla(40, 5%, 20%, 1)';
ctx.lineWidth = 3;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

const drawLineToPoint = (fromPosition, toPosition) => {
    ctx.beginPath();
    ctx.moveTo(fromPosition.x, fromPosition.y);
    ctx.lineTo(toPosition.x, toPosition.y);
    ctx.stroke();
    ctx.closePath();
};

const drawFromPlayerInput = (event) => {
    if(penDown) {
        const { offsetX, offsetY } = event;
        const toPosition = {
            x: offsetX,
            y: offsetY
        };

        let fromPosition = lastPosition;

        if(!fromPosition) {
            fromPosition = toPosition;
        };
    
        drawLineToPoint(fromPosition, toPosition);
        
        socket.emit('drawing', toPosition);
        console.log('emit drawing ');

        lastPosition = toPosition;
    };
};

window.onmousedown = (event) => {
    penDown = true;
    drawFromPlayerInput(event);
};

window.onmouseup = () => {
    penDown = false;
    lastPosition = null;
    socket.emit('line stop');
    console.log('emit line stop');
};

window.onmousemove = (event) => {
    drawFromPlayerInput(event);
};



const drawFromUpdate = (toPosition) => {
    let fromPosition = lastPosition;
    
    if(!fromPosition) {
        fromPosition = toPosition;
    };
    
    drawLineToPoint(fromPosition, toPosition);
    lastPosition = toPosition;
};


socket.on('drawing update', (toPosition) => {
    console.log('received drawing update');
    
    drawFromUpdate(toPosition);
});

socket.on('line stop', () => {
    console.log('received line stop');
    lastPosition = null;
});

socket.on('playerlist changed', (players) => {
    playerList.textContent = '';
    players.forEach(player => {
        const newPlayer = document.createElement('li');
        newPlayer.textContent = `${player.username} – ${player.points} Points`;
        playerList.appendChild(newPlayer);
    });
});

leaveGame.onclick = () => socket.emit('disconnect');

// ------------------------------------------------------------







// let isPlayersDrawingRound = false;

// let isDrawing = false;
// let currentLineIndex = 0;
// let currentPlayers = [];
// let currentWord = '';
// let isMatch = false;

// const currentDrawingData = {
//     lines: []
// };

// const answerDiv = document.getElementById('answer');

// const checkAnswer = (event) => {

//     if(!isPlayersDrawingRound && event.key === 'Enter') {
//         // console.log(currentWord);
//         const { value } = event.target;
//         if(currentWord.toLowerCase() === value.toLowerCase()) {
//             answerDiv.classList.add('right-answer');
//             isMatch = true;
//             // send match to the server
//         } else {
//             answerDiv.classList.add('wrong-answer');
//             event.target.value = '';
//             setTimeout(() => {
//                 answerDiv.classList.remove('wrong-answer')
//             },3000);
//         };
//     };
// };

// answerDiv.addEventListener('keydown', checkAnswer)


// canvas.addEventListener('mousedown', (event) => {
//     if(isPlayersDrawingRound) {
//         isDrawing = true;
    
//         // Line styles
//         ctx.strokeStyle = 'hsla(180, 80%, 20%, 1)';
//         ctx.lineWidth = 10;
//         ctx.lineJoin = 'round';
//         ctx.lineCap = 'round';
        
//         // Add start a new line in drawingData
//         const newLine = {
//             color: ctx.strokeStyle,
//             width: ctx.lineWidth,
//             points: [
//                 {
//                     x: event.offsetX,
//                     y: event.offsetY
//                 }
//             ]
//         };
    
//         currentDrawingData.lines.push(newLine);
    
//         // Rendering start point
//         ctx.beginPath();
//         ctx.moveTo(event.offsetX, event.offsetY);
//         ctx.lineTo(event.offsetX, event.offsetY);
//         ctx.stroke();
//     }
// });

// canvas.addEventListener('mouseup', () => {
//     // Close the current line and go to next line index
//     isDrawing = false;
//     currentLineIndex += 1;
//     ctx.closePath();
// });

// canvas.addEventListener('mousemove', (event) => {
//     if(isPlayersDrawingRound && isDrawing) {
//         const currentLinePoints = currentDrawingData.lines[currentLineIndex].points;

//         // Add mouse coordinates to current line
//         currentLinePoints.push({
//             x: event.offsetX,
//             y: event.offsetY
//         });
        
//         // Rendering line
//         ctx.lineTo(event.offsetX, event.offsetY);
//         ctx.stroke();
//     };
// });

// const drawPath = (points) => {
//     const startingPoint = points[0];
//     ctx.moveTo(startingPoint.x, startingPoint.y);

//     points.forEach(point => {
//         ctx.lineTo(point.x, point.y);
//     });

//     ctx.stroke();
// };

// const drawImageFromData = (drawingData) => {
//     canvas.width = canvas.width;
//     const { lines } = drawingData;
//     lines.forEach(line => {
//         ctx.strokeStyle = line.color;
//         ctx.lineWidth = line.width;
//         ctx.lineJoin = 'round';
//         ctx.lineCap = 'round';

//         drawPath(line.points);
//     });
// };

// const updatePlayerList = (players) => {
//     const playersChanged = JSON.stringify(currentPlayers) !== JSON.stringify(players);

//     if(playersChanged) {
//         currentPlayers = players;
//         playerList.textContent = '';
//         currentPlayers.forEach(player => {
//             const newPlayer = document.createElement('li');
//             newPlayer.textContent = `${player.username} – ${player.points} Points`;
//             playerList.appendChild(newPlayer);
//         });
//     };
// };

// const updateWord = (word) => {
//     wordChanged = currentWord !== word;
//     if(wordChanged) {
//         currentWord = word;
//         currentWordDisplay.textContent = currentWord;
//         currentDrawingData.lines = [];
//         isMatch = false;
//     }
// }

// const updateInterval = setInterval(() => {
//     // console.log(currentWord)
//     requestUpdate()
//         .then(data => {
//             const { players, isPlayerDrawing, drawingData, word } = data;

//             updatePlayerList(players);
//             updateWord(word);

//             isPlayersDrawingRound = isPlayerDrawing;

//             if(!isPlayersDrawingRound) {
//                 drawImageFromData(drawingData);
//             };
//         })
//         .catch(error => console.error(error));
    
    

//     if(isPlayersDrawingRound) {
//         sendUpdate(currentDrawingData);
//     } else {
//         sendUpdate(null, isMatch)
//     };

// }, 1000/5);

// ------------------------------------------------------------
