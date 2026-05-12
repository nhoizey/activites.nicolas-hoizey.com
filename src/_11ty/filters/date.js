// Luxon is already an Eleventy dependency anyway
import { DateTime } from "luxon";

// TODO: allow setting the timezone and locale
const timezone = "Europe/Paris";
const locale = "fr-FR";

const dateObj = (eleventyDate) => {
  if (eleventyDate === undefined) {
    return DateTime.now().setZone(timezone).setLocale(locale);
  }
  return DateTime.fromJSDate(eleventyDate, {
    zone: timezone,
  }).setLocale(locale);
};

// 1983
export const year = (date) => dateObj(date).toFormat("yyyy");
export const year_month = (date) => dateObj(date).toFormat("yyyy/MM");
export const month = (date) => dateObj(date).toFormat("MM");

export const durationInSeconds = (duration) => {
  const durationObject = duration?.match(/^([0-9]+):([0-9]{2}):([0-9]{2})$/);
  if (durationObject && (durationObject.length === 4)) {
    return Temporal.Duration.from({ hours: durationObject[1], minutes: durationObject[2], seconds: durationObject[3] }).total("seconds");
  }
  return 0;
};
