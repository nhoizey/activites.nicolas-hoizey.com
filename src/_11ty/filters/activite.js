import fs from "node:fs";
import path from "node:path";
import togeojson from "@mapbox/togeojson";
import { DOMParser } from 'xmldom'
import exifr from "exifr";
import { DateTime } from "luxon";
import utf8 from "utf8";


export const getTrace = (activite) => {
  const geojsonFile = path.join("src", path.dirname(activite), "trace.geojson");
  if (fs.existsSync(geojsonFile)) {
    return fs.readFileSync(geojsonFile, 'utf8');
  }

  const gpxFile = path.join("src", path.dirname(activite), "trace.gpx");
  if (fs.existsSync(gpxFile)) {
    const gpxContent = new DOMParser().parseFromString(fs.readFileSync(gpxFile, 'utf8'));
    const geoJSON = togeojson.gpx(gpxContent);
    const geoJSONString = JSON.stringify(geoJSON, null, 2);
    fs.writeFileSync(geojsonFile, geoJSONString, 'utf8');
    return geoJSONString;
  }

  return false;
};

export const getPhotos = async (activite) => {
  const exifrOptions = {
    mergeOutput: false,
    crs: false,
    dc: false,
    lr: false,
    photoshop: false,
    ifd0: {
      pick: ["ImageDescription"],
    },
    exif: [
      "DateTimeOriginal",
      "OffsetTime",
    ],

    gps: {
      pick: ["latitude", "longitude", "direction"],
    },
    iptc: { pick: ["ObjectName", "Caption", "Country", "City"] },
    userComment: false,
  };

  const cacheDir = path.join("src/_cache/photos/", path.dirname(activite));
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const photosDataCache = path.join(cacheDir, 'photos.json');
  if (fs.existsSync(photosDataCache)) {
    return JSON.parse(fs.readFileSync(photosDataCache, 'utf8'));
  }

  const photosPath = path.join("src", path.dirname(activite), "photos");
  if (fs.existsSync(photosPath) && fs.lstatSync(photosPath).isDirectory()) {
    const photosDataPromises = fs.readdirSync(photosPath)
      .filter(file => /\.jpe?g$/i.test(file))
      .map(async file => {


        const photo = {
          src: path.join(path.dirname(activite).replace(/^\/collections/, ""), "photos", file)
        };

        const photoExif = await exifr.parse(path.join(photosPath, file), exifrOptions);
        // if (file === "IMG_3400.jpeg") {
        //   console.dir(photoExif);
        // }

        const photoTitle = photoExif.dc?.title.value || photoExif.iptc?.ObjectName;
        if (photoTitle) {
          photo.title = utf8.decode(photoTitle);
        }

        const photoDescription = photoExif.ifd0?.ImageDescription.trim();
        if (photoDescription) {
          photo.description = photoDescription;
        }

        let luxonDate;
        if (photoExif.exif?.DateTimeOriginal && photoExif.exif?.OffsetTime) {
          luxonDate = DateTime.fromHTTP(
            photoExif.exif.DateTimeOriginal.toGMTString(),
          ).setZone(`UTC+${Number.parseInt(photoExif.exif.OffsetTime, 10)}`);
          photo.date = luxonDate.toISO();
          photo.readableTime = luxonDate.toFormat("H'h'mm");
        }

        if (photoExif.gps?.latitude && photoExif.gps?.longitude) {
          photo.geo = {
            latitude: photoExif.gps.latitude,
            longitude: photoExif.gps.longitude,
          };
          if (photoExif.gps?.GPSImgDirection) {
            photo.geo.direction = photoExif.gps.GPSImgDirection;
          }
          if (photoExif.iptc?.Country) {
            photo.geo.country = utf8.decode(photoExif.iptc.Country);
          }
          if (photoExif.iptc?.City) {
            // photo.geo.city = photoExif.iptc.City;
            photo.geo.city = utf8.decode(photoExif.iptc.City);
          }
        }


        return photo;
      });
    const photosData = await Promise.all(photosDataPromises);

    fs.writeFileSync(photosDataCache, JSON.stringify(photosData, null, 2), 'utf8');

    return photosData;
  }
  return false;
}
