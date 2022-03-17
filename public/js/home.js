// Expanding images
document.querySelectorAll('.drawing').forEach(drawing => {
    const expandedImg = document.getElementById('expanded-img');
    const overlayDiv = document.getElementById('overlay');
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