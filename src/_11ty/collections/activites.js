const allTypes = new Set([
	"vélo",
	"gravel",
	"vtt",
	"marche",
	"randonnée",
	"tennis",
	"padel",
	"badminton",
	"pickleball",
	"fit tennis",
	"golf",
	"ski alpin",
	"escalade",
	"voile",
]);
const typeFamilies = new Set([
	"vélo",
	"raquettes",
	"marche",
	"ski",
	"escalade",
	"golf",
	"nautisme",
]);
const monthsSet = new Set([]);

export const types = (collection) => {
	collection
		.getFilteredByGlob("src/collections/activites/**/index.md")
		.map((activite) => {
			allTypes.add(activite.data.type);
			return activite;
		});
	return [...allTypes];
};

export const type_families = (collection) => {
	collection
		.getFilteredByGlob("src/collections/activites/**/index.md")
		.map((activite) => {
			typeFamilies.add(activite.data.type_family);
			return activite;
		});
	return [...typeFamilies];
};

export const months = (collection) => {
	collection
		.getFilteredByGlob("src/collections/activites/**/index.md")
		.map((activite) => {
			monthsSet.add(activite.data.month);
			return activite;
		});
	return [...monthsSet].sort();
};
