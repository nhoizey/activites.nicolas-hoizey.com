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
	"natation",
	"snorkeling",
	"bus",
	"voiture",
	"bateau",
]);
const typeFamilies = new Set([
	"vélo",
	"raquettes",
	"marche",
	"ski",
	"escalade",
	"golf",
	"nautisme",
	"transport"
]);
const monthsSet = new Set([]);

export const activitesListees = (collection) => collection
	.getFilteredByGlob("src/collections/activites/**/index.md")
	.filter((activite) => activite.data.listed !== false)
	.sort((a, b) => b.date - a.date);

export const types = (collection) => {
	collection
		.getFilteredByGlob("src/collections/activites/**/index.md")
		.filter((activite) => activite.data.listed !== false)
		.map((activite) => {
			allTypes.add(activite.data.type);
			return activite;
		});
	return [...allTypes];
};

export const type_families = (collection) => {
	collection
		.getFilteredByGlob("src/collections/activites/**/index.md")
		.filter((activite) => activite.data.listed !== false)
		.map((activite) => {
			typeFamilies.add(activite.data.type_family);
			return activite;
		});
	return [...typeFamilies];
};

export const months = (collection) => {
	collection
		.getFilteredByGlob("src/collections/activites/**/index.md")
		.filter((activite) => activite.data.listed !== false)
		.map((activite) => {
			monthsSet.add(activite.data.month);
			return activite;
		});
	return [...monthsSet].sort();
};

export const activityStats = (collection) => {
	const oneYearAgo = Temporal.PlainDate.from(Temporal.Now.plainDateISO()).subtract({ years: 1 });
	const stats = {
		"full": {
			"all": { duration: 0, distance: 0, elevation: 0 },
			"oneYear": { duration: 0, distance: 0, elevation: 0 }
		}
	};

	collection
		.getFilteredByGlob("src/collections/activites/**/index.md")
		.filter((activite) => activite.data.listed !== false)
		.map((activite) => {
			const family = activite.data.type_family;
			if (stats[family] === undefined) {
				stats[family] = {
					"all": { duration: 0, distance: 0, elevation: 0 },
					"oneYear": { duration: 0, distance: 0, elevation: 0 }
				};
			}

			const thisActivityTemporal = Temporal.PlainDate.from(activite.date.toISOString().slice(0, 10));
			const thisPastYear = Temporal.PlainDateTime.compare(thisActivityTemporal, oneYearAgo) === 1;

			const durationObject = activite.data.duration?.match(/^([0-9]+):([0-9]{2}):([0-9]{2})$/);
			if (durationObject && (durationObject.length === 4)) {
				const activityDuration = Temporal.Duration.from({ hours: durationObject[1], minutes: durationObject[2], seconds: durationObject[3] }).total("seconds");
				stats.full.all.duration += activityDuration;
				stats[family].all.duration += activityDuration;

				if (thisPastYear) {
					stats.full.oneYear.duration += activityDuration;
					stats[family].oneYear.duration += activityDuration;
				}
			}

			stats.full.all.distance += activite.data.distance || 0;
			stats[family].all.distance += activite.data.distance || 0;
			if (thisPastYear) {
				stats.full.oneYear.distance += activite.data.distance || 0;
				stats[family].oneYear.distance += activite.data.distance || 0;
			}

			stats.full.all.elevation += activite.data.elevation || 0;
			stats[family].all.elevation += activite.data.elevation || 0;
			if (thisPastYear) {
				stats.full.oneYear.elevation += activite.data.elevation || 0;
				stats[family].oneYear.elevation += activite.data.elevation || 0;
			}

			return activite;
		});
	for (const key of Object.keys(stats)) {
		stats[key].all.duration = Temporal.Duration.from({ seconds: stats[key].all.duration }).round({ largestUnit: "days", smallestUnit: "hours" }).toLocaleString("fr-FR", { style: "long" });
		stats[key].oneYear.duration = Temporal.Duration.from({ seconds: stats[key].oneYear.duration }).round({ largestUnit: "days", smallestUnit: "hours" }).toLocaleString("fr-FR", { style: "long" });
	}

	return [stats];
};
