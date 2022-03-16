
// Set up canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const playerList = document.getElementById('player-list');
const currentTaskDisplay = document.getElementById('current-task');
const leaveGame = document.getElementById('leave-game');
const readyButton = document.getElementById('ready');
const timerDisplay = document.getElementById('timer');
const skipButton = document.getElementById('skip');

canvas.width = 600;
canvas.height = 600;

const socket = io();

let currentWord = '';
let lastDrawPosition = null;
let penDown = false;
let drawingPlayerId = null;
let roundInProgress = false;

socket.emit('join game', gameId, userId);

ctx.strokeStyle = 'hsla(40, 5%, 20%, 1)';
ctx.lineWidth = 3;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

const setTimerDisplay = (secondsLeft) => {
    timerDisplay.textContent = 'Time left: ' + secondsLeft.toString();
};

const changeVisibility = (elementId, changeToVisible) => {
    const element = document.getElementById(elementId);
    if(changeToVisible) {
        element.style.visibility = 'visible';
    } else {
        element.style.visibility = 'hidden';
    };
};

const drawFromData = (drawingData) => {
    drawingData.forEach(line => {
        let fromPosition = line[0];
        line.forEach(toPosition => {
            drawLineToPoint(fromPosition, toPosition);
            fromPosition = toPosition;
        });
    });
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

const setUi = (drawingPlayerId, activeRound) => {

    const setGuessingUi = () => {
        isDrawingPlayer = false;
        clearCanvasInteraction();
        changeVisibility('answer', true);
        currentTaskDisplay.textContent = `Guess the word!`;
        answerInput.disabled = false;
        changeVisibility('skip', false);
    };
    
    const setDrawingUi = () => {
        isDrawingPlayer = true;
        setCanvasInteraction();
        changeVisibility('answer', false);
        currentTaskDisplay.textContent = `Draw '${currentWord}'!`;
        answerInput.disabled = true;
        changeVisibility('skip', true);
    };

    if(activeRound) {
        changeVisibility('ready', false);
    } else {
        changeVisibility('ready', true);
    };

    if(drawingPlayerId === userId) {
        setDrawingUi();
    } else {
        setGuessingUi();
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

skipButton.onclick = () => socket.emit('skip');