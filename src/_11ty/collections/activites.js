export const types = (collection) => {
  const types = new Set(["gravel", "VTT", "marche", "tennis", "padel", "ski alpin"]);
  collection
    .getFilteredByGlob("src/collections/activites/**/index.md")
    .map((activite) => types.add(activite.data.type));
  return [...types];
}
