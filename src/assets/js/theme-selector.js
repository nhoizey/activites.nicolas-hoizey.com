const themeSelector = document.querySelector('#theme-select');
if (themeSelector) {
  themeSelector.value = localStorage.getItem('theme') || 'system';
  themeSelector.addEventListener('change', (event) => {
    const theme = event.target.value;
    document.querySelector('html').dataset.theme = theme;
    localStorage.setItem('theme', theme);
  });
}