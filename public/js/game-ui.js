// Set up canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const playerList = document.getElementById('player-list');

canvas.width = 1000;
canvas.height = 600;

let isPlayersDrawingRound = true;
let isDrawing = false;
let currentLineIndex = 0;
let currentPlayers = [];

const drawingData = {
    lines: []
}; 

canvas.addEventListener('mousedown', (event) => {
    if(isPlayersDrawingRound) {
        isDrawing = true;
    
        // Line styles
        ctx.strokeStyle = 'hsla(180, 80%, 20%, 1)';
        ctx.lineWidth = 10;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        // Add start a new line in drawingData
        const newLine = {
            color: ctx.strokeStyle,
            width: ctx.lineWidth,
            points: [
                {
                    x: event.offsetX,
                    y: event.offsetY
                }
            ]
        };
    
        drawingData.lines.push(newLine);
    
        // Rendering start point
        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    // Close the current line and go to next line index
    isDrawing = false;
    currentLineIndex += 1;
    ctx.closePath();
});

canvas.addEventListener('mousemove', (event) => {
    if(isPlayersDrawingRound && isDrawing) {
        const currentLinePoints = drawingData.lines[currentLineIndex].points;

        // Add mouse coordinates to current line
        currentLinePoints.push({
            x: event.offsetX,
            y: event.offsetY
        });
        
        // Rendering line
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    };
});

const drawPath = (points) => {
    const startingPoint = points[0];
    ctx.moveTo(startingPoint.x, startingPoint.y);

    points.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });

    ctx.stroke();
};

const drawImageFromData = (drawingData) => {
    const { lines } = drawingData;
    lines.forEach(line => {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        drawPath(line.points);
    })
};

const updatePlayerList = (response) => {
    const { players } = response.data;
    const playersChanged = JSON.stringify(currentPlayers) !== JSON.stringify(players);

    if(playersChanged) {
        currentPlayers = players;
        playerList.textContent = '';
        currentPlayers.forEach(player => {
            const newPlayer = document.createElement('li');
            newPlayer.textContent = `${player.username} – ${player.points} Points`;
            playerList.appendChild(newPlayer);
        });
    };
};

const updateInterval = setInterval(() => {
    
    if(isPlayersDrawingRound) {
        
        axios.post(window.location.pathname + '/data', drawingData)
            .then(response => {
                isPlayersDrawingRound = response.data.isPlayerDrawing;
                updatePlayerList(response);
            })
            .catch(error => {
                console.error(error);
            });

    } else {
        
        axios.get(window.location.pathname + '/data')
            .then(response => {
                isPlayersDrawingRound = response.data.isPlayerDrawing;
                updatePlayerList(response);
                const { drawingData } = response.data;
                canvas.width = canvas.width;
                drawImageFromData(drawingData);
            })
            .catch(error => {
                console.error(error);
            });

    };

}, 1000/5);