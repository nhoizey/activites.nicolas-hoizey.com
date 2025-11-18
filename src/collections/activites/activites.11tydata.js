import fs from "node:fs";
import path from "node:path";
import exifr from "exifr";
import { DateTime } from "luxon";
import utf8 from "utf8";
import { execSync } from 'node:child_process';
import togeojson from "@mapbox/togeojson";
import { DOMParser } from 'xmldom'
import { z } from "zod";
import { fromZodError } from 'zod-validation-error';

const EXIFR_OPTIONS = {
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
    "ExifImageWidth",
    "ExifImageHeight"
  ],
  gps: {
    pick: ["latitude", "longitude", "direction"],
  },
  iptc: { pick: ["ObjectName", "Caption", "Country", "City"] },
  userComment: false,
};


export default {
  eleventyDataSchema: (data) => {
    const result = z.object({
      draft: z.boolean().or(z.undefined()),
    }).safeParse(data);

    if (result.error) {
      throw fromZodError(result.error);
    }
  },
  eleventyComputed: {
    month: (data) => {
      if (!data.page.filePathStem.match(/^\/collections\/activites\/[0-9]{4}/)) {
        return false;
      }
      return `${DateTime.fromJSDate(data.date).toFormat('yyyy-MM')}-01`;
    },
    type_family: async (data) => {
      if (!data.page.filePathStem.match(/^\/collections\/activites\/[0-9]{4}/)) {
        return false;
      }
      const familyOfType = {
        "vélo": "vélo",
        "gravel": "vélo",
        "vtt": "vélo",
        "marche": "marche",
        "randonnée": "marche",
        "tennis": "raquettes",
        "padel": "raquettes",
        "pickleball": "raquettes",
        "badminton": "raquettes",
        "golf": "golf",
        "ski alpin": "ski",
        "escalade": "escalade",
        "voile": "nautisme"
      };
      if (data.type && familyOfType[data.type] !== undefined) {
        return familyOfType[data.type];
      }
      return "autre";
    },
    photos: async (data) => {
      if (!data.page.filePathStem.match(/^\/collections\/activites\/[0-9]{4}/)) {
        return false;
      }
      const cacheDir = path.join("src/_cache/photos/", path.dirname(data.page.filePathStem));
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const photosDataCache = path.join(cacheDir, 'photos.json');
      if (fs.existsSync(photosDataCache)) {
        return JSON.parse(fs.readFileSync(photosDataCache, 'utf8'));
      }

      const photosPath = path.join("src", path.dirname(data.page.filePathStem), "photos");
      if (fs.existsSync(photosPath) && fs.lstatSync(photosPath).isDirectory()) {
        const photosDataPromises = fs.readdirSync(photosPath)
          .filter(file => /\.jpe?g$/i.test(file))
          .map(async file => {
            const photo = {
              src: path.join("photos", file)
            };

            let photoExif;
            try {
              photoExif = await exifr.parse(path.join(photosPath, file), EXIFR_OPTIONS);
            } catch (err) {
              console.error(`Error reading EXIF data for photo: ${photo.src}`, err);
            }

            if (!photoExif) {
              console.warn(`No EXIF data found for photo: ${path.join(photosPath, photo.src)}`);
            }

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

            if (photoExif.exif.ExifImageWidth && photoExif.exif.ExifImageHeight) {
              photo.dimensions = {
                width: photoExif.exif.ExifImageWidth,
                height: photoExif.exif.ExifImageHeight,
              };
            } else {
              console.warn(`No dimensions in EXIF for ${path.join(photosPath, photo.src)}`);
            }

            return photo;
          });
        const photosData = await Promise.all(photosDataPromises);

        fs.writeFileSync(photosDataCache, JSON.stringify(photosData, null, 2), 'utf8');

        return photosData;
      }
      return false;
    },
    trace: (data) => {
      if (!data.page.filePathStem.match(/^\/collections\/activites\/[0-9]{4}/)) {
        return false;
      }

      const cacheDir = path.join("src/_cache/traces/", path.dirname(data.page.filePathStem));
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const geojsonFile = path.join(cacheDir, "trace.geojson");
      if (fs.existsSync(geojsonFile)) {
        return fs.readFileSync(geojsonFile, 'utf8');
      }

      let gpxContentFile;
      const gpsbabelFile = path.join(cacheDir, "gpsbabel.gpx");
      if (fs.existsSync(gpsbabelFile)) {
        gpxContentFile = gpsbabelFile;
      } else {
        const originalGpxFile = path.join("src", path.dirname(data.page.filePathStem), "sources/original.gpx");
        if (fs.existsSync(originalGpxFile)) {
          // Use GPSBabel to simplify the GPX file with 5 meters tolerance
          // https://www.gpsbabel.org/htmldoc-development/filter_simplify.html
          execSync(`/opt/homebrew/bin/gpsbabel -r -i gpx -f ${originalGpxFile} -x simplify,error=0.0005k -o gpx -F ${gpsbabelFile}`);
          gpxContentFile = gpsbabelFile;
        }
      }

      if (gpxContentFile) {
        const gpxContent = new DOMParser().parseFromString(fs.readFileSync(gpxContentFile, 'utf8'));
        const geoJSON = togeojson.gpx(gpxContent);
        geoJSON.features[0].properties.type = data.type;
        geoJSON.features[0].properties.month = `${geoJSON.features[0].properties.time.slice(0, 7)}-01`;
        const geoJSONString = JSON.stringify(geoJSON);
        fs.writeFileSync(geojsonFile, geoJSONString, 'utf8');

        // The first time we also write the file in the final _site folder
        const siteDir = path.join("_site", path.dirname(data.page.filePathStem).replace(/^\/collections\//, ''));
        if (!fs.existsSync(siteDir)) {
          fs.mkdirSync(siteDir, { recursive: true });
        }
        fs.writeFileSync(path.join(siteDir, 'trace.geojson'), geoJSONString, 'utf8');

        return geoJSONString;
      }

      return false;
    },
    map: (data) => {
      if (!data.page.filePathStem.match(/^\/collections\/activites\/[0-9]{4}/)) {
        return false;
      }

      const cachedMap = path.join("src/_cache/maps/", path.dirname(data.page.filePathStem), "map.jpeg");
      if (!fs.existsSync(cachedMap)) {
        return false;
      }

      return true;
    }
  }
};

