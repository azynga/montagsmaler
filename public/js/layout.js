
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(navlink => {
    const randomRotation = (Math.random() * 10) - 5;
    
    navlink.style.transform = `rotate(${randomRotation}deg)`
});

const formLabels = document.querySelectorAll('.auth-form label');

formLabels.forEach(label => {
    const randomRotation = (Math.random() * 4) - 2;
    label.style.transform = `rotate(${randomRotation}deg)`
});

const inputFields = document.querySelectorAll('.auth-form input');

inputFields.forEach(input => {
    const randomRotation = (Math.random() * 2) - 1;
    input.style.transform = `rotate(${randomRotation}deg)`
});