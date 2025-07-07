(() => {
	// Add data-theme attribute to html element based on localStorage value
	document.querySelector('html').dataset.theme = localStorage.getItem('theme') || 'system';
})();
