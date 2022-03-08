

class DrawingUi extends GameUi {
    constructor() {
        super();
        this.linesDrawn = [];
        this.isDrawing = false;
        this.currentLineIndex = 0;
    }

    updateWordDisplay() {
        const currentWordDisplay = document.getElementById('current-word');
        currentWordDisplay.textContent = this.currentWord;
    }
}