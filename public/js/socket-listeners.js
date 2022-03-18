socket.on('connect',() => setUi())

socket.on('reconnect', (gameData) => {
    const {
        drawingData,
        drawingPlayerId,
        currentWord: currentWordFromServer,
        secondsLeft,
        activeRound
    } = gameData;

    drawFromData(drawingData);
    currentWord = currentWordFromServer;
    setTimerDisplay(secondsLeft);
    setUi(drawingPlayerId, activeRound);
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
        newPlayer.textContent = `${player.username}: ${player.points} Points`;
        playerList.appendChild(newPlayer);
    });
});

socket.on('next word', (currentWordFromServer, currentRound) => {
    console.log('received next word')
    if(drawingPlayerId === userId && currentRound > 0) {

        axios.post(`/game/${gameId}/drawing-store`, {
            creator: userId,
            word: currentWord,
            url: canvas.toDataURL(),
            isPublic: false
        });
        
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentWord = currentWordFromServer;
    
    if(drawingPlayerId === userId) {
        currentTaskDisplay.textContent = `Draw '${currentWord}'!`;
    }
});

socket.on('start round', (drawingPlayerIdFromServer) => {
    drawingPlayerId = drawingPlayerIdFromServer;
    setUi(drawingPlayerId, true);
});

socket.on('tick', secondsLeft => {
    roundInProgress = true;
    setTimerDisplay(secondsLeft);
});

socket.on('end round', () => {
    roundInProgress = false;
    readyButton.style.visibility = 'visible';
    changeVisibility('skip', false);
    clearCanvasInteraction();
});

socket.on('end game', (players) => {
    console.log('received end game');
    // playAgainButton.style.visibility = 'visible';
    
    setEndGameUi(players);
});