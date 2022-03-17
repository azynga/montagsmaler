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
// Delete button
document.querySelectorAll('.delete-button').forEach(button => {
    button.onclick = () => confirm('Do you really want to delete this drawing? It can\'t be undone.')
});
// Publish button
document.querySelectorAll('.publish-button').forEach(button => {
    button.onclick = () => confirm('Do you really want to publish this drawing? It can\'t be undone.')
});
