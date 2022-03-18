const drawingCards = document.querySelectorAll('.drawing-card');

const cardRandomizer = (cardList) => {
    cardList.forEach((card, index, cardList) => {
        const randomColor = () => {
            const randomHue = Math.floor(Math.random() * 36) * 10 ;
            const hsl = `hsl(${randomHue}, 80%, 30%)`;
            return hsl;
        }
    
        card.style.transitionDelay = `${index / 4}s`;
        card.style.backgroundColor = randomColor();
        setTimeout(() => {
            card.style.transitionDelay = '0s'
        }, cardList.length * 1000 / 4)
    
        const randomDegree = Math.floor(Math.random() * 60) - 30;
        card.style.background = `linear-gradient(${randomDegree}deg, ${randomColor()}, ${randomColor()})`;
    
        const randomRotation = Math.floor(Math.random() * 70) - 35;
        card.style.transform = `rotate(${randomRotation}deg)`;
    
        const randomX = Math.floor(Math.random() * 100) - 50;
        const randomY = Math.floor(Math.random() * 100);
        card.style.position = 'relative';
        card.style.left = `${randomX}px`;
        card.style.top = `${randomY}px`;
    
        card.style.opacity = '1';
    });
};

setTimeout(() => {
    cardRandomizer(drawingCards);
}, 50)