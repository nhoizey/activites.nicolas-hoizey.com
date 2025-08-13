import { inline_icon } from "./icons.js";
import { isoDate, readableDate } from "eleventy-plugin-pack11ty/_11ty/filters/date.js";

export function embed(...pathStems) {
  if (pathStems.length === 0) return "";

  // Collections are available in `this.ctx.collections` in classic (not arrow) functions
  // https://github.com/11ty/eleventy/issues/813#issuecomment-1037874929

  let embed = `<div class="embed"><div class="cards">`;
  for (const pathStem of pathStems) {
    const activitiesWithSlug = this.ctx.collections.activites.filter(
      (item) => {
        return item.page.filePathStem.replace(/^\/collections\/activites\/(.*)index$/, "$1") === pathStem;
      }
    );
    if (activitiesWithSlug.length === 1) {
      const activity = activitiesWithSlug[0];
      embed += `<div class="card">
  <div class="type">
    ${inline_icon(activity.data.type)}
    <small>${activity.data.type}</small>
  </div>
  <h3><a href="${activity.url}">${activity.data.title}</a></h3>
  <ul class="meta">
    <li class="date">
      <svg class="icon" aria-hidden="true"><use xlink:href="#date-icon" /></svg>
      <time class="dt-published" datetime="${isoDate(activity.date)}" data-pagefind-sort="date[datetime]">${readableDate(isoDate(activity.date))}</time>
    </li>
    ${activity.data.distance ?
          `<li class="distance">
        ${inline_icon('map')}
        <span>${activity.data.distance} km</span>
      </li>`: ''}
    ${activity.data.duration ?
          `<li class="duration">
        ${inline_icon('duration')}
        <span>${activity.data.duration}</span>
      </li>`: ''}
  </ul>
</div>`;
    }
  }
  embed += '</div><div class="map"></div>';
  return embed;
}
