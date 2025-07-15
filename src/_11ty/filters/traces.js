import fs from "node:fs";
import path from "node:path";
import togeojson from "@mapbox/togeojson";
import { DOMParser } from 'xmldom'

export const getTrace = (activite) => {
  const geojsonFile = path.join("src", path.dirname(activite), "trace.geojson");
  if (fs.existsSync(geojsonFile)) {
    return fs.readFileSync(geojsonFile, 'utf8');
  }

  const gpxFile = path.join("src", path.dirname(activite), "trace.gpx");
  if (fs.existsSync(gpxFile)) {
    const gpxContent = new DOMParser().parseFromString(fs.readFileSync(gpxFile, 'utf8'));
    const geoJSON = togeojson.gpx(gpxContent);
    fs.writeFileSync(geojsonFile, JSON.stringify(geoJSON, null, 2), 'utf8');
    return geoJSON;
  }

  return false;
};
