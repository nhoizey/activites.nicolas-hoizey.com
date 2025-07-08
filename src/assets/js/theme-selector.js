const themeSelector = document.querySelector('#theme-selector');
if (themeSelector) {
  themeSelector.elements.theme.value = localStorage.getItem('theme') || 'auto';
  themeSelector.querySelector('fieldset').addEventListener('change', () => {
    const newTheme = themeSelector.elements.theme.value;
    document.querySelector('html').dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
  });
}