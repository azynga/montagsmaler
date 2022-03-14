// Set up canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const playerList = document.getElementById('player-list');
const currentWordDisplay = document.getElementById('current-word');
const leaveGame = document.getElementById('leave-game');
const readyButton = document.getElementById('ready');

const gameId = window.location.pathname.slice(6);

canvas.width = 600;
canvas.height = 600;

let isDrawing = false; // drawing player
let currentLineIndex = 0; // drawing player
let currentPlayers = []; // both players
let currentWord = ''; // both players

const socket = io();

let lastPosition = null;
let penDown = false;
let isDrawingPlayer = false;


socket.emit('join game', gameId);

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

const setCanvasInteraction = () => {
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
};

const clearCanvasInteraction = () => {
    window.onmousedown = null;
    window.onmouseup = null;
    window.onmousemove = null;
};

socket.on('is drawing player', () => {
    isDrawingPlayer = true;
    setCanvasInteraction();
    currentWordDisplay.textContent = currentWord;
    currentWordDisplay.style.visibility = 'visible';
    // showWordDisplay();
    // hideInput();
});

socket.on('is guessing player', () => {
    isDrawingPlayer = false;
    clearCanvasInteraction();
    currentWordDisplay.style.visibility = 'hidden';

    // hideWordDisplay();
    // showInput();
});


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

socket.on('playerlist change', (players) => {
    playerList.textContent = '';
    players.forEach(player => {
        const newPlayer = document.createElement('li');
        newPlayer.textContent = `${player.username} – ${player.points} Points`;
        playerList.appendChild(newPlayer);
    });
});

socket.on('next word', (word) => {
    console.log('received next word')
    const drawingUrl = canvas.toDataURL();
    socket.emit('store drawing', drawingUrl);

    currentWord = word;
    currentWordDisplay.textContent = currentWord;

});

socket.on('end round', () => {
    clearCanvasInteraction();
});

const answerInput = document.getElementById('answer')
answerInput.addEventListener('keydown', (event) =>{
    const currentAttempt = answerInput.value;
    if(currentAttempt.length > 0 && event.code === 'Enter'){
        // console.log(currentAttempt, currentWord);
        if(currentAttempt.toLowerCase() === currentWord.toLowerCase()) {
            // console.log(currentAttempt);
            answerInput.classList.add('right-answer');
            answerInput.value = '';
            setTimeout(() => {
                answerInput.classList.remove('right-answer');
            }, 3000);
            socket.emit('correct guess');
        } else{
            // console.log(currentAttempt);
            answerInput.classList.add('wrong-answer');
            answerInput.value = '';
            setTimeout(() => {
                answerInput.classList.remove('wrong-answer');
            }, 3000);
        };
    };
});



readyButton.onclick = () => socket.emit('player ready');

leaveGame.onclick = () => socket.emit('leave game');


// ------------------------------------------------------------



// const updateWord = (word) => {
//     const wordChanged = currentWord !== word;
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

//     });


// let isPlayersDrawingRound = false;

// let isDrawing = false;
// let currentLineIndex = 0;
// let currentPlayers = [];
// let currentWord = '';
// let isMatch = false;

// const currentDrawingData = {
//     lines: []
// };


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
