const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 600;

let drawing = false;
const previousPosition

console.log(window.event)

canvas.addEventListener('mousedown', (event) => {
    // const { offsetX, off}
    drawing = true;
    console.log('drawing');

});

canvas.addEventListener('mouseup', (event) => {
    drawing = false;
    console.log('not drawing anymore');

});

canvas.addEventListener('mousemove', (event) => {
    if(drawing) {
        ctx.beginPath();
        ctx.moveTo()
    }
});

const trackMouse = () => {
    window.onmousemove = (event) => {

        if(drawing) {
            
            pixels.push({
                x: event.offsetX,
                y: event.offsetY
            });
        };
    };
};