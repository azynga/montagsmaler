// Expanding images
const expandedImg = document.getElementById('expanded-img');
const overlayDiv = document.getElementById('overlay');
document.querySelectorAll('.drawing-small').forEach(drawing => {
    drawing.onclick = () => {
        overlayDiv.classList.add('overlay');
        expandedImg.src = drawing.src;
        expandedImg.alt = drawing.alt;
        console.log(expandedImg);
    };
    overlayDiv.onclick = () => {
        overlay.classList.remove('overlay');
        expandedImg.src = '';
        expandedImg.alt = '';
    };
});