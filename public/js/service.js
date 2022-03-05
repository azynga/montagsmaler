// const dataPackage = {};

const sendUpdate = (drawingData) => {
    
    axios.post(window.location.pathname + '/data', drawingData)
        .then(() => {
            console.log('Data was sent');
        })
        .catch(error => {
            console.error(error);
        });
}

const requestUpdate = () => {
    return axios.get(window.location.pathname + '/data')
        .then(response => {
            const { isPlayerDrawing, drawingData, players, word } = response.data;
            return {
                players,
                isPlayerDrawing,
                drawingData,
                word
            };
        })
        .catch(error => {
            console.error(error);
        });
}