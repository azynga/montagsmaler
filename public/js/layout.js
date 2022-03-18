
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(navlink => {
    const randomRotation = (Math.random() * 10) - 5;
    
    navlink.style.transform = `rotate(${randomRotation}deg)`
});
