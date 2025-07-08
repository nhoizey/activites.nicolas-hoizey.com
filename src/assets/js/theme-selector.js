const themeSelector = document.querySelector('#theme-selector');

if (themeSelector) {
  // Get the range input element
  const rangeInput = themeSelector.querySelector('input[type="range"]');

  // Get the list of theme items
  const themeItems = themeSelector.querySelectorAll('.theme-labels li');

  // Get the list of theme names
  const themes = [...themeItems].map((item) => item.className);

  // Set the initial value based on localStorage or default to 'auto'
  rangeInput.value = themes.indexOf(localStorage.getItem('theme') || 'auto');

  // Update the theme when the range input changes
  rangeInput.addEventListener('input', (event) => {
    const newTheme = themes[event.target.value];
    document.querySelector('html').dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
  });

  // Add event listeners to the labels
  themeItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      rangeInput.value = index;
      rangeInput.dispatchEvent(new Event('input'));
    });
  });
}