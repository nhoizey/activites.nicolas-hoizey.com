export const types = (collection) =>
  collection
    .getFilteredByGlob("src/collections/activites/**/index.md")
    .map((activite) => activite.data.type)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();
