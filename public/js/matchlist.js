
let lastGamesInfo = null;


const updateGameList = (gamesInfo) => {

    const gamesInfoArray = Object.values(gamesInfo);
    const gameList = document.getElementById('game-list');

    if(gamesInfoArray.length <= 0) {
        gameList.innerHTML = '<b>No games found :(</b>'
    } else {
        gameList.innerHTML = '';
        const createGameCard = (gameInfo, index) => {
            const { gameId, inProgress, isUserGame, players } = gameInfo;
    
            const gameCard = document.createElement('li');
            gameCard.id = gameId;
            gameCard.classList.add('game');
    
            if(isUserGame) {
                gameCard.classList.add('user-game');
            } else if(inProgress) {
                gameCard.classList.add('in-progress');
            };
    
            const title = document.createElement('h3');
            title.textContent = `Game No. ${index + 1}`;
    
            const playerCount = document.createElement('h4');
            playerCount.textContent = `Players: ${players.length}`;
    
            const joinButton = document.createElement('h4');
            if(inProgress && !isUserGame) {
                joinButton.textContent = 'In progress';
            } else if (isUserGame) {
                joinButton.textContent = 'Your game';
            } else {
                joinButton.textContent = 'Join';
            };
            joinButton.classList.add('button', 'join');
    
            const link = document.createElement('a');
            if(!inProgress || isUserGame) {
                link.href = `/game/${gameId}`;
            };
            link.append(title, playerCount, joinButton);
            gameCard.append(link);
    
            return gameCard;
        };
    
        gamesInfoArray.forEach((game, index) => {
            const gameCard = createGameCard(game, index);
            gameList.append(gameCard);
        });
    };
};

setInterval(() => {
    axios.get('/game/matchlist/data')
        .then(response => {
            const { gamesInfo } = response.data;
            if(JSON.stringify(gamesInfo) !== JSON.stringify(lastGamesInfo)) {
                updateGameList(gamesInfo);
                lastGamesInfo = gamesInfo;
            };
        })
        .catch(error => console.error(error));
}, 500);