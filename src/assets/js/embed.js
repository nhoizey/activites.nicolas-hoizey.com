import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import { lineString, bbox, bearing, point } from "@turf/turf";
import { colorsOnDark } from '../../_data/colors.js';
import { route_settings } from './route-settings.js';
import { fetchGeojson } from "./fetch-geojson.js";

(async (window) => {
  const MAX_ZOOM_LEVEL = 18;

  const highligthRoute = (map, activityId, bbox) => {
    map.setPaintProperty(`route-${activityId}-shadow`, 'line-width', route_settings.route_highlight_width + route_settings.route_shadow_additional_width);
    map.setPaintProperty(`route-${activityId}`, 'line-width', route_settings.route_highlight_width).setPaintProperty(`route-${activityId}`, 'line-opacity', route_settings.route_highlight_opacity);
    if (bbox !== undefined) {
      map.fitBounds(bbox, {
        fitBoundsOptions: {
          padding: 25
        },
        pitch: 0,
        bearing: 0,
        duration: 3000,
        essential: true,
      });
    }
  };
  const unhighligthRoute = (map, activityId, bbox) => {
    map.setPaintProperty(`route-${activityId}-shadow`, 'line-width', route_settings.route_width + route_settings.route_shadow_additional_width);
    map.setPaintProperty(`route-${activityId}`, 'line-width', route_settings.route_width).setPaintProperty(`route-${activityId}`, 'line-opacity', route_settings.route_opacity);
    if (bbox !== undefined) {
      map.fitBounds(bbox, {
        fitBoundsOptions: {
          padding: 25
        },
        pitch: 0,
        bearing: 0,
        duration: 3000,
        essential: true,
      });
    }
  };

  // Load Mapbox map if necessary
  if (window.embeds !== undefined) {
    for (const [embedId, embedData] of Object.entries(window.embeds)) {
      const embed = window.document.querySelector(`[data-embed-id="${embedId}"]`);
      const mapElementId = `map-${embedId}`;
      const mapElement = window.document.querySelector(`#${mapElementId}`);

      let allCoordinates = [];

      // TODO: use Promise.all to fetch all traces in parallel
      for (let [activityId, geoJsonData] of Object.entries(embedData)) {
        if (geoJsonData === false) {
          geoJsonData = await fetchGeojson(`/activites/${activityId}trace.geojson`);
          embedData[activityId] = geoJsonData;
        }
        allCoordinates = [...allCoordinates, ...geoJsonData.features[0].geometry.coordinates];
      }
      const embedBbox = bbox(lineString(allCoordinates));

      if (mapElement) {
        mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;
        const map = new mapboxgl.Map({
          container: mapElementId,
          style: "mapbox://styles/mapbox/standard-satellite",
          config: {
            basemap: {
              show3dObjects: false,
              showLandmarkIcons: true,
            }
          },
          projection: "globe",
          bounds: embedBbox,
          fitBoundsOptions: {
            padding: 50
          },
          attributionControl: true,
          interactive: false,
          hash: false,
          renderWorldCopies: false,
          language: "fr",
        });

        map.on('load', () => {
          let traceIndex = 0;

          for (const [activityId, geoJsonData] of Object.entries(embedData)) {
            const activityBbox = bbox(lineString(geoJsonData.features[0].geometry.coordinates))

            map.addSource(`trace-${activityId}-shadow`, {
              type: "geojson",
              data: geoJsonData,
            });
            map.addLayer({
              'id': `route-${activityId}-shadow`,
              'type': 'line',
              'source': `trace-${activityId}-shadow`,
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-color': 'black',
                'line-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 0,
                  12, 0,
                  16, route_settings.route_width + route_settings.route_shadow_additional_width
                ],
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 0,
                  12, 0,
                  16, route_settings.route_shadow_opacity
                ],
              }
            });

            map.addSource(`trace-${activityId}`, {
              type: "geojson",
              data: geoJsonData,
            });
            map.addLayer({
              'id': `route-${activityId}`,
              'type': 'line',
              'source': `trace-${activityId}`,
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-color': colorsOnDark[traceIndex % colorsOnDark.length],
                'line-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 40,
                  16, route_settings.route_width
                ],
                'line-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, .6,
                  16, route_settings.route_opacity
                ],
              }
            });

            const activity = embed.querySelector(`[data-activity-id="${activityId}"]`);

            // Add interactivity on the routes on the map
            map.on('mouseenter', `route-${activityId}`, () => {
              highligthRoute(map, activityId);
            });
            map.on('mouseleave', `route-${activityId}`, () => {
              unhighligthRoute(map, activityId);
            });
            map.on('click', `route-${activityId}`, () => {
              highligthRoute(map, activityId, activityBbox);
              activity.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            // Add interactivity on the activities in the list
            activity.addEventListener("mouseenter", () => {
              highligthRoute(map, activityId, activityBbox);
            });
            activity.addEventListener("mouseleave", () => {
              unhighligthRoute(map, activityId, embedBbox);
            });

            traceIndex++;
          }

          map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': MAX_ZOOM_LEVEL
          });
          map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 2 });

          // https://docs.mapbox.com/mapbox-gl-js/example/navigation-scale/
          map.addControl(new mapboxgl.ScaleControl());
        });
      }
    }
  }
})(window);
