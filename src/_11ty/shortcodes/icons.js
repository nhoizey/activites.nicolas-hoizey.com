import fs from "node:fs";
import path from "node:path";
import { sharedSlugify } from '../../../node_modules/eleventy-plugin-pack11ty/_11ty/utils/slugify.js';

const ICONS_FOLDERS = {
  lucide: "node_modules/lucide-static/icons/",
  simple: "node_modules/simple-icons/icons/",
  local: "src/assets/svg/",
};

const ICONS = {
  blog: { name: "newspaper", source: "lucide" },
  camera: { name: "camera", source: "lucide" },
  date: { name: "calendar-days", source: "lucide" },
  distance: { name: "ruler", source: "lucide" },
  download: { name: "download", source: "lucide" },
  duration: { name: "timer", source: "lucide" },
  feeds: { name: "rss", source: "lucide" },
  filter: { name: "funnel", source: "lucide" },
  home: { name: "house", source: "lucide" },
  info: { name: "info", source: "lucide" },
  map: { name: "map", source: "lucide" },
  recits: { name: "route", source: "lucide" },
  search: { name: "search", source: "lucide" },
  share: { name: "share", source: "lucide" },
  statistics: { name: "pie-chart", source: "lucide" },
  tag: { name: "tag", source: "lucide" },

  komoot: { name: "komoot", source: "simple" },
  mastodon: { name: "mastodon", source: "simple" },
  strava: { name: "strava", source: "simple" },

  velo: { name: "velo", source: "local" }, // https://www.svgrepo.com/svg/509755/bicycle MIT
  gravel: { name: "gravel", source: "local" }, // https://www.svgrepo.com/svg/509755/bicycle MIT
  vtt: { name: "vtt", source: "local" }, // https://www.svgrepo.com/svg/509755/bicycle MIT
  tennis: { name: "tennis", source: "local" }, // https://www.svgrepo.com/svg/308122/tennis-person-play-sport CC0
  padel: { name: "padel", source: "local" }, // https://www.svgrepo.com/svg/308122/tennis-person-play-sport CC0
  marche: { name: "marche", source: "local" }, // https://www.svgrepo.com/svg/308152/walking-person-go-walk-move
  "ski-alpin": { name: "ski-alpin", source: "local" }, // https://www.svgrepo.com/svg/521848/skiing
};

const inline_iconMemoize = {};

export const inline_icon = (icon) => {
  const iconName = sharedSlugify(icon);

  if (inline_iconMemoize[iconName]) {
    return inline_iconMemoize[iconName];
  }
  const { name, source } = ICONS[iconName] || { name: iconName, source: "local" };
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
    `viewBox="0 0 24 24" width="1.2em" height="1.2em" id="${iconName}-icon" class="icon" aria-hidden="true"`,
  );
  inline_iconMemoize[iconName] = inlineSvg;
  return inlineSvg;
};

const external_iconMemoize = {};

export const external_icon = (icon) => {
  const iconName = sharedSlugify(icon);

  if (external_iconMemoize[iconName]) {
    return external_iconMemoize[iconName];
  }

  const externalSvg = fs.readFileSync(
    `src/static/ui/icons/${iconName}.svg`,
    "utf8",
  );
  const width =
    Number.parseFloat(externalSvg.replace(/^.*?width="([^"]+)".*/, "$1")) * 16;
  const height =
    Number.parseFloat(externalSvg.replace(/^.*?height="([^"]+)".*/, "$1")) * 16;
  const inlineHtml = `<img src="/ui/icons/${iconName}.svg" width="${width}" height="${height}" class="icon" loading="lazy" alt="" />`;
  external_iconMemoize[iconName] = inlineHtml;
  return inlineHtml;
};
