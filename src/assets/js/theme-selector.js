const themes = ['light', 'auto', 'dark'];
const themeSelector = document.querySelector('#theme-selector');

if (themeSelector) {
  // Get the range input element
  const rangeInput = themeSelector.querySelector('input[type="range"]');

  // Set the initial value based on localStorage or default to 'auto'
  rangeInput.value = themes.indexOf(localStorage.getItem('theme') || 'auto');

  // Add event listeners to the labels
  themeSelector.querySelectorAll('.theme-labels li').forEach((label, index) => {
    label.addEventListener('click', () => {
      rangeInput.value = index;
      rangeInput.dispatchEvent(new Event('input'));
    });
  });

  // Update the theme when the range input changes
  rangeInput.addEventListener('input', (event) => {
    const newTheme = themes[event.target.value];
    document.querySelector('html').dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
  });
}