socket.on('reconnect', (game) => {
    getCurrentGameState(game);
});

socket.on('drawing update', (toPosition) => {
    console.log('received drawing update');
    drawFromUpdate(toPosition);
});

socket.on('line stop', () => {
    console.log('received line stop');
    lastDrawPosition = null;
});

socket.on('playerlist change', (players) => {
    playerList.textContent = '';
    players.forEach(player => {
        const newPlayer = document.createElement('li');
        newPlayer.textContent = `${player.username} – ${player.points} Points`;
        playerList.appendChild(newPlayer);
    });
});

socket.on('next word', (word, currentRound) => {
    console.log('received next word')
    if(isDrawingPlayer && currentRound > 0) {

        axios.post(`/game/${gameId}/drawing-store`, {
            creator: userId,
            word: currentWord,
            url: canvas.toDataURL(),
            isPublic: false
        });
        
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentWord = word;
    currentWordDisplay.textContent = currentWord;
});

socket.on('start round', (drawingPlayerId) => {

    readyButton.style.visibility = 'hidden';
    timer.textContent = 120;

    timerId = setInterval(() => {
        timer.textContent -= 1;
        if(timer.textContent <= 0) {
            clearInterval(timerId);
        };
    }, 1000);

    if(drawingPlayerId === userId) {
        isDrawingPlayer = true;
        setCanvasInteraction();
        currentWordDisplay.textContent = currentWord;
        currentWordDisplay.style.visibility = 'visible';
        answerInput.disabled = true;
        // showWordDisplay();
        // hideInput();
    } else {
        isDrawingPlayer = false;
        clearCanvasInteraction();
        currentWordDisplay.style.visibility = 'hidden';
        answerInput.disabled = false;
        // hideWordDisplay();
        // showInput();
    };
});

socket.on('end round', () => {
    readyButton.style.visibility = 'visible';
    clearCanvasInteraction();
});

socket.on('end game', () => {

});