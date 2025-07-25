import fs from "node:fs";
import path from "node:path";

const ICONS_FOLDERS = {
  feather: "node_modules/feather-icons/dist/icons/",
  majesticons: "node_modules/majesticons/line/",
  simple: "node_modules/simple-icons/icons/",
  local: "src/assets/svg/",
};

const ICONS = {
  blog: { name: "article-line", source: "majesticons" },
  date: { name: "calendar-line", source: "majesticons" },
  camera: { name: "camera-line", source: "majesticons" },
  home: { name: "home-line", source: "majesticons" },
  info: { name: "info-circle-line", source: "majesticons" },
  landscape: { name: "image-line", source: "majesticons" },
  map: { name: "map-simple-marker-line", source: "majesticons" },
  tag: { name: "tag-line", source: "majesticons" },
  share: { name: "share-line", source: "majesticons" },
  duration: { name: "timer-line", source: "majesticons" },
  search: { name: "search-line", source: "majesticons" },
  statistics: { name: "pie-chart", source: "feather" },
  download: { name: "download", source: "feather" },
  feeds: { name: "rss", source: "feather" },
  mastodon: { name: "mastodon", source: "simple" },

  vélo: { name: "vélo", source: "local" }, // https://www.svgrepo.com/svg/509755/bicycle
  gravel: { name: "gravel", source: "local" }, // https://www.svgrepo.com/svg/509755/bicycle
  tennis: { name: "tennis", source: "local" }, // https://www.svgrepo.com/svg/308122/tennis-person-play-sport
  padel: { name: "padel", source: "local" }, // https://www.svgrepo.com/svg/308122/tennis-person-play-sport
  marche: { name: "marche", source: "local" }, // https://www.svgrepo.com/svg/308152/walking-person-go-walk-move
};

const inline_iconMemoize = {};

export const inline_icon = (icon) => {
  if (inline_iconMemoize[icon]) {
    return inline_iconMemoize[icon];
  }
  const { name, source } = ICONS[icon] || { name: icon, source: "local" };
  let inlineSvg = fs.readFileSync(
    path.join(ICONS_FOLDERS[source], `${name}.svg`),
    "utf8",
  );

  if (source !== "local") {
    inlineSvg = inlineSvg.replace('width="24" height="24"', "");
    inlineSvg = inlineSvg.replace(/fill="[^"]+"/g, "");
    inlineSvg = inlineSvg.replace(/stroke="[^"]+"/g, "");
    inlineSvg = inlineSvg.replace(/stroke-width="[^"]+"/g, "");
    inlineSvg = inlineSvg.replace(/stroke-linecap="[^"]+"/g, "");
    inlineSvg = inlineSvg.replace(/stroke-linejoin="[^"]+"/g, "");
    inlineSvg = inlineSvg.replace(/class="[^"]+"/g, "");
  }

  inlineSvg = inlineSvg.replace(
    'viewBox="0 0 24 24"',
    `viewBox="0 0 24 24" width="1.2em" height="1.2em" id="${icon}-icon" class="icon" aria-hidden="true"`,
  );
  inline_iconMemoize[icon] = inlineSvg;
  return inlineSvg;
};

const external_iconMemoize = {};

export const external_icon = (icon) => {
  if (external_iconMemoize[icon]) {
    return external_iconMemoize[icon];
  }

  const externalSvg = fs.readFileSync(
    `src/static/ui/icons/${icon}.svg`,
    "utf8",
  );
  const width =
    Number.parseFloat(externalSvg.replace(/^.*?width="([^"]+)".*/, "$1")) * 16;
  const height =
    Number.parseFloat(externalSvg.replace(/^.*?height="([^"]+)".*/, "$1")) * 16;
  const inlineHtml = `<img src="/ui/icons/${icon}.svg" width="${width}" height="${height}" class="icon" loading="lazy" alt="" />`;
  external_iconMemoize[icon] = inlineHtml;
  return inlineHtml;
};
