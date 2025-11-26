// Mobile menu and theme toggle
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
const themeToggle = document.getElementById('themeToggle');

menuBtn.addEventListener('click', () => {
    nav.classList.toggle('show');
});

themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const isLight = root.classList.toggle('light');
    themeToggle.textContent = isLight ? 'Light' : 'Dark';
    try { localStorage.setItem('site-theme-light', isLight ? '1' : '0'); } catch (e) { }
});

// persist theme
(function () {
    try {
        const saved = localStorage.getItem('site-theme-light');
        if (saved === '1') {
            document.documentElement.classList.add('light');
            themeToggle.textContent = 'Light';
        } else {
            themeToggle.textContent = 'Dark';
        }
    } catch (e) { }
})();