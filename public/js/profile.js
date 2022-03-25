// Expanding images
document.querySelectorAll('.drawing-small').forEach(drawing => {
    const expandedImg = document.getElementById('expanded-img');
    const overlayDiv = document.getElementById('overlay');
    const downloadLink = document.getElementById('download-link');

    drawing.onclick = () => {
        overlayDiv.classList.add('overlay');
        expandedImg.src = drawing.src;
        expandedImg.alt = drawing.alt;
        downloadLink.href = drawing.src;
        downloadLink.download = drawing.alt;
        downloadLink.style.visibility = 'visible';
    };
    overlayDiv.onclick = () => {
        overlay.classList.remove('overlay');
        expandedImg.src = '';
        expandedImg.alt = '';
        downloadLink.style.visibility = 'hidden';
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
