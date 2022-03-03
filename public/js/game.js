// Set up canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 600;


let isDrawing = false;
let isPlayersDrawingRound = true;
let currentLineIndex = 0;

const drawingData = {
    lines: []
}; 

canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;

    // Line styles
    ctx.strokeStyle = 'blue';
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
});

canvas.addEventListener('mouseup', () => {
    // Close the current line and go to next line index
    isDrawing = false;
    currentLineIndex += 1;
    ctx.closePath();
});

canvas.addEventListener('mousemove', (event) => {
    if(isDrawing) {
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

const drawImageFromData = (lines) => {
    lines.forEach(line => {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 10;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        drawPath(line.points);
    })
};

const updateInterval = setInterval(() => {

    if(isPlayersDrawingRound && isDrawing) {
        axios.post('/game/data', drawingData)
            .then(sentDrawingData => {
                
            })
            .catch(error => {
                console.error(error);
            });
    } else {
        axios.get('/game/data')
            .then(requestedDrawingData => {
                const { lines } = requestedDrawingData.data;
                // console.log(lines);
                drawImageFromData(lines);
            })
            .catch(error => {
                console.error(error);
            });
    }

}, 1000/5);

document.getElementById('drawing-button').addEventListener('click', () => {
    isPlayersDrawingRound = true;
});

document.getElementById('not-drawing-button').addEventListener('click', () => {
    isPlayersDrawingRound = false;
});