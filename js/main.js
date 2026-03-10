const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

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
