
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


socket.on('drawing update', (toPosition) => {
    console.log('received drawing update');
    
    drawFromUpdate(toPosition);
});

socket.on('line stop', () => {
    console.log('received line stop');
    lastDrawPosition = null;
});

socket.on('playerlist change', (players) => {
    playerList.textContent = '';
    players.forEach(player => {
        const newPlayer = document.createElement('li');
        newPlayer.textContent = `${player.username} – ${player.points} Points`;
        playerList.appendChild(newPlayer);
    });
});

socket.on('next word', (word, currentRound) => {
    console.log('received next word')
    if(isDrawingPlayer && currentRound > 0) {

        axios.post(`/game/${gameId}/drawing-store`, {
            creator: userId,
            word: currentWord,
            url: canvas.toDataURL(),
            isPublic: false
        });
        
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentWord = word;
    currentWordDisplay.textContent = currentWord;
});

socket.on('start round', (drawingPlayerId) => {

    readyButton.style.visibility = 'hidden';
    timer.textContent = 120;

    timerId = setInterval(() => {
        timer.textContent -= 1;
        if(timer.textContent <= 0) {
            clearInterval(timerId);
        };
    }, 1000);

    if(drawingPlayerId === userId) {
        isDrawingPlayer = true;
        setCanvasInteraction();
        currentWordDisplay.textContent = currentWord;
        currentWordDisplay.style.visibility = 'visible';
        answerInput.disabled = true;
        // showWordDisplay();
        // hideInput();
    } else {
        isDrawingPlayer = false;
        clearCanvasInteraction();
        currentWordDisplay.style.visibility = 'hidden';
        answerInput.disabled = false;
        // hideWordDisplay();
        // showInput();
    };
});

socket.on('end round', () => {

    readyButton.style.visibility = 'visible';
    clearCanvasInteraction();
});

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