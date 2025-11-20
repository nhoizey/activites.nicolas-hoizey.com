import fs from "node:fs";
import path from "node:path";

export const fixPhotoUrls = (content, filePathStem) => {
	return content.replace(
		/src="photos\//g,
		`src="/collections/activites/${filePathStem}photos/`,
	);
};

export const addPhotoDimensions = (content, filePathStem, width = false) => {
	const matches = content.match(/<img src="[^"]+"/g);

	if (!matches) {
		return content;
	}

	const photoCacheDir = path.join(
		"src/_cache/photos",
		filePathStem.replace(/\/index$/, ""),
	);
	const photosDataCache = path.join(photoCacheDir, "photos.json");

	if (!fs.existsSync(photosDataCache)) {
		console.log(`No photo cache found at ${photosDataCache}`);
		return content;
	}

	let newContent = content;

	const photosData = JSON.parse(fs.readFileSync(photosDataCache, "utf8"));

	matches.forEach((match) => {
		const src = match.match(/src="([^"]+)"/)[1];
		const cleanSrc = src.replace("./photos/", "photos/");

		const photoData = photosData.find(
			(photo) => photo.src === cleanSrc && photo.dimensions !== undefined,
		);

		if (photoData) {
			if (width !== false) {
				newContent = newContent.replace(
					`<img src="${src}"`,
					`<img src="${src}" width="${width}" height="${Math.round(photoData.dimensions.height * (width / photoData.dimensions.width))}"`,
				);
			} else {
				newContent = newContent.replace(
					`<img src="${src}"`,
					`<img src="${src}" width="${photoData.dimensions.width}" height="${photoData.dimensions.height}"`,
				);
			}
		}
	});

	return newContent;
};
