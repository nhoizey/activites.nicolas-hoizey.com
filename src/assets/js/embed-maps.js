import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import { lineString, bbox, bearing, point } from "@turf/turf";
import { colorsOnDark } from '../../_data/colors.js';

(async (window) => {
  const MAX_ZOOM_LEVEL = 18;

  const highligthRoute = (map, activityId, bbox) => {
    map.setPaintProperty(`route-${activityId}-white`, 'line-width', 8).setPaintProperty(`route-${activityId}-white`, 'line-opacity', 1);
    map.setPaintProperty(`route-${activityId}`, 'line-width', 6).setPaintProperty(`route-${activityId}`, 'line-opacity', 1);
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
    map.setPaintProperty(`route-${activityId}-white`, 'line-width', 5).setPaintProperty(`route-${activityId}-white`, 'line-opacity', .8);
    map.setPaintProperty(`route-${activityId}`, 'line-width', 3).setPaintProperty(`route-${activityId}`, 'line-opacity', .8);
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

      for (const [activityId, geoJsonData] of Object.entries(embedData)) {
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

            map.addSource(`trace-${activityId}-white`, {
              type: "geojson",
              data: geoJsonData,
            });
            map.addLayer({
              'id': `route-${activityId}-white`,
              'type': 'line',
              'source': `trace-${activityId}-white`,
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-color': 'white',
                'line-width': 5,
                'line-opacity': .8,
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
                'line-width': 3,
                'line-opacity': .8,
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
