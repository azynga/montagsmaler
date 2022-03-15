
// Set up canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const playerList = document.getElementById('player-list');
const currentWordDisplay = document.getElementById('current-word');
const leaveGame = document.getElementById('leave-game');
const readyButton = document.getElementById('ready');
const timer = document.getElementById('timer');

canvas.width = 600;
canvas.height = 600;

const socket = io();

let currentWord = ''; // both players
let lastDrawPosition = null;
let penDown = false;
let isDrawingPlayer = false;
let timerId = null;

socket.emit('join game', gameId, userId);

ctx.strokeStyle = 'hsla(40, 5%, 20%, 1)';
ctx.lineWidth = 3;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

const getCurrentGameState = (game) => {

};

const drawLineToPoint = (fromPosition, toPosition) => {
    ctx.beginPath();
    ctx.moveTo(fromPosition.x, fromPosition.y);
    ctx.lineTo(toPosition.x, toPosition.y);
    ctx.stroke();
    ctx.closePath();
};

const drawFromPlayerInput = (event) => {
    if(penDown) {
        // console.log(event.offsetX, event.offsetY);
        const { offsetX, offsetY } = event;
        const toPosition = {
            x: offsetX,
            y: offsetY
        };

        let fromPosition = lastDrawPosition;

        if(!fromPosition) {
            fromPosition = toPosition;
        };
    
        drawLineToPoint(fromPosition, toPosition);
        
        socket.emit('drawing', toPosition);
        console.log('emit drawing ');

        lastDrawPosition = toPosition;
    };
};

const setCanvasInteraction = () => {
    canvas.onmousedown = (event) => {
        penDown = true;
        drawFromPlayerInput(event);
    };
    
    canvas.onmouseup = () => {
        penDown = false;
        lastDrawPosition = null;
        socket.emit('line stop');
        console.log('emit line stop');
    };
    
    canvas.onmousemove = (event) => {
        drawFromPlayerInput(event);
    };

    canvas.onmouseout = () => {
        penDown = false;
        lastDrawPosition = null;
        socket.emit('line stop');
        console.log('emit line stop');
    }
};

const clearCanvasInteraction = () => {
    canvas.onmousedown = null;
    canvas.onmouseup = null;
    canvas.onmousemove = null;
};

const drawFromUpdate = (toPosition) => {
    let fromPosition = lastDrawPosition;
    
    if(!fromPosition) {
        fromPosition = toPosition;
    };
    
    drawLineToPoint(fromPosition, toPosition);
    lastDrawPosition = toPosition;
};

const answerInput = document.getElementById('answer');

answerInput.addEventListener('keydown', (event) =>{
    const currentAttempt = answerInput.value;
    
    if(currentAttempt.length > 0 && event.key === 'Enter'){
        answerInput.value = '';
        
        if(currentAttempt.toLowerCase() === currentWord.toLowerCase()) {
            answerInput.classList.add('right-answer');
            setTimeout(() => {
                answerInput.classList.remove('right-answer');
            }, 3000);
            socket.emit('correct guess');
        } else{
            answerInput.classList.add('wrong-answer');
            setTimeout(() => {
                answerInput.classList.remove('wrong-answer');
            }, 3000);
        };
    };
});

readyButton.onclick = () => socket.emit('player ready');

leaveGame.onclick = () => socket.emit('leave game');