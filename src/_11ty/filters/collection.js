export const type = (collection, type) => {
  return collection
    .filter((activite) => activite.data.type === type);
};
