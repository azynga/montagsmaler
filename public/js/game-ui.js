
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

ctx.strokeStyle = 'hsl(0, 80%, 0%)';
ctx.lineWidth = 3;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

const setDefaulLineStyle = () => {
    ctx.strokeStyle = 'hsl(0, 80%, 0%)';
    ctx.lineWidth = 2.56;
    const widthSamples = document.querySelectorAll('.width-sample > div');
    widthSamples.forEach(widthSample => widthSample.style.backgroundColor = ctx.strokeStyle);
}

const createColorPicker = () => {
    const colorPicker = document.createElement('div');
    const howManyColors = 18;
    colorPicker.id = 'color-picker';

    const createColorSample = (hue, lightness) => {
        const colorSample = document.createElement('button');
        const hsl = `hsl(${hue}, 80%, ${lightness}%)`;

        colorSample.classList.add('color-sample');
        colorSample.style.backgroundColor = hsl;
        // colorSample.textContent = '.';
        
        colorSample.onclick = () => {
            ctx.strokeStyle = hsl;
            const widthSamples = document.querySelectorAll('.width-sample > div');
            widthSamples.forEach(widthSample => widthSample.style.backgroundColor = hsl);
            socket.emit('change line style', hsl, ctx.lineWidth);
        };

        return colorSample;
    };

    for(let i = 0; i < howManyColors; i ++) {
        const hue = i * (360 / howManyColors);
        colorPicker.append(createColorSample(hue, 50));
    };

    colorPicker.append(createColorSample(0, 100), createColorSample(0, 0));

    colorPicker.style.visibility = 'hidden';
    document.getElementById('canvas-container').append(colorPicker);
}

const createWidthPicker = () => {
    const widthPicker = document.createElement('div');
    // const howManyWidths = 10;
    const maxWidth = 70;
    const minWidth = 1;

    widthPicker.id = 'width-picker';

    const createWidthSample = (width) => {
        const widthSampleContainer = document.createElement('button');
        
        widthSampleContainer.classList.add('width-sample');
        
        const widthSample = document.createElement('div');
        const widthPx = `${width}px`;

        widthSample.style.width = widthPx;
        widthSample.style.height = '100%';
        widthSample.style.backgroundColor = 'black';

        widthSampleContainer.append(widthSample);
        
        widthSampleContainer.onclick = () => {
            ctx.lineWidth = width;
            socket.emit('change line style', ctx.strokeStyle, width);
        };

        return widthSampleContainer;
    };

    for(let width = minWidth; width <= maxWidth; width *= 1.6) {
        // const range = maxWidth - minWidth;
        // const width = minWidth + (range / howManyWidths) * i;

        widthPicker.append(createWidthSample(width));
    };

    widthPicker.style.visibility = 'hidden';
    document.getElementById('canvas-container').append(widthPicker);
}

createWidthPicker();
createColorPicker();

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
        console.log(line);
        if(line[0]) {
            ctx.strokeStyle = line[0].color;
            ctx.lineWidth = line[0].width;
            let fromPosition = line[1];
            line.forEach((toPosition, index) => {
                if(index === 0) {
                    return;
                };
                drawLineToPoint(fromPosition, toPosition);
                fromPosition = toPosition;
            });
        }
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

        socket.emit('drawing', toPosition, ctx.strokeStyle, ctx.lineWidth);
        console.log('emit drawing ');

        lastDrawPosition = toPosition;
    };
};

const setUi = (drawingPlayerId, roundInProgress) => {

    const setGuessingUi = () => {
        isDrawingPlayer = false;
        clearCanvasInteraction();
        changeVisibility('answer', true);
        changeVisibility('timer', true);
        changeVisibility('current-task', true);
        currentTaskDisplay.textContent = `Guess the word!`;
        answerInput.disabled = false;
        changeVisibility('skip', false);
        changeVisibility('color-picker', false);
        changeVisibility('width-picker', false);
        // document.getElementById('color-picker').style.width = '0px';
        // document.getElementById('width-picker').style.height = '0px';
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
        changeVisibility('color-picker', true);
        changeVisibility('width-picker', true);
        // document.getElementById('color-picker').style.width = '15px';
        // document.getElementById('color-picker').onmouseover = (event) => event.target.style.width = '50px';
        // document.getElementById('color-picker').onmouseout = (event) => event.target.style.width = '15px';
        // document.getElementById('width-picker').style.height = '15px';
        // document.getElementById('width-picker').onmouseover = (event) => event.target.style.height = '50px';
        // document.getElementById('width-picker').onmouseout = (event) => event.target.style.height = '15px';
    };

    const setClearUi = () => {
        isDrawingPlayer = false;
        clearCanvasInteraction();
        changeVisibility('answer', false);
        changeVisibility('skip', false);
        changeVisibility('timer', false);
        changeVisibility('current-task', false);
        changeVisibility('ready', true);
        changeVisibility('color-picker', false);
        changeVisibility('width-picker', false);
        // document.getElementById('color-picker').style.width = '0px';
        // document.getElementById('width-picker').style.height = '0px';
    }

    if (roundInProgress) {
        changeVisibility('ready', false);
        if (drawingPlayerId === userId) {
            setDrawingUi();
        }else {
            setGuessingUi();
        };
    } else {
        setClearUi();
    };
};

const setEndGameUi = (players) => {
    isGameOver = true;
    // clearCanvasInteraction();
    setUi();

    const scoreScreen = document.createElement('div');
    scoreScreen.id = 'overlay';

    body.appendChild(scoreScreen);

    const scoreList = document.createElement('ul');
    scoreList.classList.add('final-score');
    // scoreScreen.appendChild(scoreList);

    const sortedPlayers = sortByPoints(players); // There is probably thousand better ways to do this, but I don't know/ am afraid to test
    const winnerElement = document.createElement('h2');
    // scoreScreen.appendChild(winnerElement);
    winnerElement.innerText = `${players[0].username} won!`;

    sortedPlayers.forEach(player => {           // Same as above
        const playerListItem = document.createElement('li');
        playerListItem.innerText = `${player.username}: ${player.points}`;
        scoreList.appendChild(playerListItem);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'end-buttons';

    const playAgainButton = document.createElement('button');
    const leaveGameButton = document.createElement('a');

    leaveGameButton.href = `/`;

    // playAgainButton.id = 'restart';
    playAgainButton.classList.add('button');
    playAgainButton.innerText = 'Play Again';

    // leaveGameButton.id = 'leave-game';
    leaveGameButton.classList.add('button');
    leaveGameButton.innerText = 'Leave room';
    
    buttonContainer.append(playAgainButton, leaveGameButton);

    const endMessageContainer = document.createElement('div');
    endMessageContainer.id = 'end-message';

    endMessageContainer.append(winnerElement, scoreList, buttonContainer);
    scoreScreen.append(endMessageContainer);

    scoreScreen.classList.add('end-overlay');

    // changeVisibility('restart', true);
    playAgainButton.onclick = () => {
        scoreScreen.remove();
        setUi();
    };
    leaveGameButton.onclick = () => socket.emit('leave game', userId);
};


const setCanvasInteraction = () => {
    canvas.onmousedown = (event) => {
        penDown = true;
        drawFromPlayerInput(event);
    };

    window.onmouseup = () => {
        if(penDown) {
            penDown = false;
            lastDrawPosition = null;
            socket.emit('line stop');
            console.log('emit line stop');
        };
    };

    canvas.onmousemove = (event) => {
        drawFromPlayerInput(event);
    };

    canvas.onmouseout = () => {
        if(penDown) {
            lastDrawPosition = null;
        };
    }
};

const clearCanvasInteraction = () => {
    canvas.onmousedown = null;
    canvas.onmouseup = null;
    canvas.onmousemove = null;
    canvas.onmouseout = null;
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
            canvas.classList.add('right-answer');
            setTimeout(() => {
                canvas.classList.remove('right-answer');
            }, 1500);
            socket.emit('correct guess');
        } else {
            canvas.classList.add('wrong-answer');
            setTimeout(() => {
                canvas.classList.remove('wrong-answer');
            }, 1500);
        };
    };
});

const sortByPoints = (players) => {
    return players.sort((a, b) => b.points - a.points);
    return sortedPlayers
};

readyButton.onclick = () => {
    socket.emit('player ready');
    changeVisibility('ready', false);
};

leaveGame.onclick = () => confirm('Are you sure you want to leave the game?') && socket.emit('leave game', userId);

skipButton.onclick = () => socket.emit('skip');


// for testing
// window.onclick = () => setEndGameUi([
//     {
//         username: 'vitor',
//         userId,
//         points: 5,
//         isReady: false,
//         drawingRoundsCount: 0
//     },
//     {
//         username: 'aljoscha',
//         userId,
//         points: 2,
//         isReady: false,
//         drawingRoundsCount: 0
//     },
//     {
//         username: 'dina',
//         userId,
//         points: 4,
//         isReady: false,
//         drawingRoundsCount: 0
//     }
// ]);

// window.onclick = () => {
//     createColorPicker();
// };