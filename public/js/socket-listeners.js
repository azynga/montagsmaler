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

socket.on('change color', (color) => {
    ctx.strokeStyle = color;
});

socket.on('playerlist change', (players) => {
    playerList.textContent = '';
    players.sort((playerA, playerB) => {
        return playerB.points - playerA.points;
    });

    players.forEach(player => {
        const newPlayer = document.createElement('li');
        newPlayer.innerHTML = `${player.username}: <span class="points">${player.points}</span> Points`;
        if(player.isReady) {
            newPlayer.classList.add('player-ready');
        }
        playerList.appendChild(newPlayer);
    });
});

socket.on('next word', (currentWordFromServer) => {
    console.log('received next word')

    const isDrawingOnCanvas = ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0);

    if(drawingPlayerId === userId && isDrawingOnCanvas) {

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
    changeVisibility('answer', false);
    changeVisibility('current-task', false);
    changeVisibility('timer', false);

    clearCanvasInteraction();
    ctx.strokeStyle = 'hsl(0, 80%, 0%)';
});

socket.on('end game', (players) => {
    console.log('received end game');
    
    setEndGameUi(players);
});