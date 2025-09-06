export const types = (collection) => {
  const types = new Set(["vélo", "gravel", "vtt", "marche", "randonnée", "tennis", "padel", "badminton", "golf", "ski alpin"]);
  collection
    .getFilteredByGlob("src/collections/activites/**/index.md")
    .map((activite) => types.add(activite.data.type));
  return [...types];
}
