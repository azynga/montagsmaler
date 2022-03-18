
// Set up canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const [body] = document.getElementsByTagName('body');
const playerList = document.getElementById('player-list');
const scoreScreen = document.getElementById('score-screen');
const currentTaskDisplay = document.getElementById('current-task');
const leaveGame = document.getElementById('leave-game');
const readyButton = document.getElementById('ready');
const timerDisplay = document.getElementById('timer');
const skipButton = document.getElementById('skip');
let isGameOver = false;

canvas.width = 600;
canvas.height = 600;

const socket = io();

let currentWord = '';
let lastDrawPosition = null;
let penDown = false;
let drawingPlayerId = null;
let roundInProgress = false;
// let gameOver = false;

socket.emit('join game', gameId, userId);

ctx.strokeStyle = 'hsla(40, 5%, 20%, 1)';
ctx.lineWidth = 3;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

const setTimerDisplay = (secondsLeft) => {
    timerDisplay.innerHTML = `Time left: <span class="time">${secondsLeft.toString()}</span>`;
};

const changeVisibility = (elementId, changeToVisible) => {
    const element = document.getElementById(elementId);
    if (changeToVisible) {
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
    if (penDown) {
        const { offsetX, offsetY } = event;
        const toPosition = {
            x: offsetX,
            y: offsetY
        };

        let fromPosition = lastDrawPosition;

        if (!fromPosition) {
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
        changeVisibility('timer', true);
        changeVisibility('current-task', true);
        currentTaskDisplay.textContent = `Guess the word!`;
        answerInput.disabled = false;
        changeVisibility('skip', false);
    };

    const setDrawingUi = () => {
        isDrawingPlayer = true;
        setCanvasInteraction();
        changeVisibility('current-task', true);
        changeVisibility('answer', false);
        currentTaskDisplay.textContent = `Draw '${currentWord}'!`;
        answerInput.disabled = true;
        changeVisibility('skip', true);
        changeVisibility('timer', true);

    };

    const setClearUi = () => {
        isDrawingPlayer = false;
        clearCanvasInteraction();
        changeVisibility('answer', false);
        changeVisibility('skip', false);
        changeVisibility('timer', false);
        changeVisibility('current-task', false);
        changeVisibility('ready', true);
    }

    if (activeRound) {
        changeVisibility('ready', false);
        if (drawingPlayerId === userId) {
            setDrawingUi();
        }else {
            setGuessingUi();
        };
    } else {
        setClearUi();
    };

    // if (drawingPlayerId === userId) {
    //     setDrawingUi();
    // } else {
    //     setGuessingUi();
    // };
};

const setEndGameUi = (players) => {
    isGameOver = true;
    console.log('end game function');
    clearCanvasInteraction();

    const scoreScreen = document.createElement('div');
    scoreScreen.id = 'overlay';

    body.appendChild(scoreScreen);

    const scoreList = document.createElement('ul');
    scoreScreen.appendChild(scoreList);

    const sortedPlayers = sortByPoints(players); // There is probably thousand better ways to do this, but I don't know/ am afraid to test
    const winnerElement = document.createElement('h2');
    scoreScreen.appendChild(winnerElement);
    winnerElement.innerText = `${players[0].username} won!`;

    sortedPlayers.forEach(player => {           // Same as above
        const finalScoreList = document.createElement('li');
        finalScoreList.innerText = `${player.username}: ${player.points}`;
        scoreList.appendChild(finalScoreList);
    });

    const playAgainButton = document.createElement('button');
    const leaveGameButton = document.createElement('a');

    leaveGameButton.href = `${location.origin}`;

    playAgainButton.id = 'restart';
    playAgainButton.classList.add('button');
    playAgainButton.innerText = 'Play Again';
    scoreScreen.appendChild(playAgainButton);

    leaveGameButton.id = 'leave-game';
    leaveGameButton.classList.add('button');
    leaveGameButton.innerText = 'Leave room';
    scoreScreen.appendChild(leaveGameButton);

    scoreScreen.classList.add('overlay');

    // changeVisibility('restart', true);
    playAgainButton.onclick = () => {
        scoreScreen.remove();
        setUi();
    };
    leaveGameButton.onclick = () => socket.emit('leave game');
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

    if (!fromPosition) {
        fromPosition = toPosition;
    };

    drawLineToPoint(fromPosition, toPosition);
    lastDrawPosition = toPosition;
};

const answerInput = document.getElementById('answer');

answerInput.addEventListener('keydown', (event) => {
    const currentAttempt = answerInput.value;

    if (currentAttempt.length > 0 && event.key === 'Enter') {
        answerInput.value = '';

        if (currentAttempt.toLowerCase() === currentWord.toLowerCase()) {
            answerInput.classList.add('right-answer');
            setTimeout(() => {
                answerInput.classList.remove('right-answer');
            }, 3000);
            socket.emit('correct guess');
        } else {
            answerInput.classList.add('wrong-answer');
            setTimeout(() => {
                answerInput.classList.remove('wrong-answer');
            }, 3000);
        };
    };
});

const sortByPoints = (players) => {
    return players.sort((a, b) => b.points - a.points);
    return sortedPlayers
};



readyButton.onclick = () => socket.emit('player ready');

leaveGame.onclick = () => confirm('Are you sure you want to leave the game?') && socket.emit('leave game');

skipButton.onclick = () => socket.emit('skip');
