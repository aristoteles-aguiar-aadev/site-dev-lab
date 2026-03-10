const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const logoTop = document.getElementById('logoTop');

if (logoTop) {
    logoTop.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('mobile-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('#mainNav a').forEach((link) => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('mobile-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', (event) => {
        const clickedOutside = !mainNav.contains(event.target) && !menuToggle.contains(event.target);
        if (clickedOutside) {
            mainNav.classList.remove('mobile-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}