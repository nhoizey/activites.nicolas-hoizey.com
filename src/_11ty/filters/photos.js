export const fixPhotoUrls = (content, filePathStem) => {
	return content.replace(/src="photos\//g, `src="/collections/activites/${filePathStem}photos/`);
};
