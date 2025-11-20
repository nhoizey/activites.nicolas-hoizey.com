export const type = (collection, type) => {
	return collection.filter((activite) => activite.data.type === type);
};

export const type_family = (collection, type_family) => {
	return collection.filter(
		(activite) => activite.data.type_family === type_family,
	);
};

export const withPathStem = (collection, pathStem) => {
	return collection.filter((activite) => {
		return (
			activite.page.filePathStem.replace(
				/^\/collections\/activites\/(.*)index$/,
				"$1",
			) === pathStem
		);
	})[0];
};
