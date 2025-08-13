import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import { lineString, bbox, bearing, point } from "@turf/turf";

(async (window) => {
  const MAX_ZOOM_LEVEL = 18;
  const TRACE_COLORS_ON_DARK = ['#8a3ffc', '#33b1ff', '#007d79', '#ff7eb6', '#fa4d56', '#fff1f1', '#6fdc8c', '#4589ff', '#d12771', '#d2a106', '#08bdba', '#bae6ff', '#ba4e00', '#d4bbff'];

  // Load Mapbox map if necessary
  if (window.embeds !== undefined) {
    for (const [embedId, embedData] of Object.entries(window.embeds)) {
      const mapElementId = `map-${embedId}`;
      const mapElement = window.document.querySelector(`#${mapElementId}`);

      let allCoordinates = [];

      for (const [activityId, geoJsonData] of Object.entries(embedData)) {
        allCoordinates = [...allCoordinates, ...geoJsonData.features[0].geometry.coordinates];
      }
      const bboxCoordinates = bbox(lineString(allCoordinates));

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
          bounds: bboxCoordinates,
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
                'line-width': 6,
                'line-opacity': 1,
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
                'line-color': TRACE_COLORS_ON_DARK[traceIndex % TRACE_COLORS_ON_DARK.length],
                'line-width': 4,
                'line-opacity': 1,
              }
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

          // window.document.querySelectorAll("ul.activites a").forEach((getElementById){     //   const isoDate = activity.querySelector("time").getAttribute("datetime");
          //   if (isoDate in geoJsonDatas) {
          //     activity.addEventListener("mouseenter", (event) => {
          //       map.setPaintProperty(`route-${isoDate}`, 'line-opacity', 1).setPaintProperty(`route-${isoDate}`, 'line-width', 5);
          //       map.fitBounds(bbox(lineString(geoJsonDatas[isoDate].features[0].geometry.coordinates)), {
          //         fitBoundsOptions: {
          //           padding: 25
          //         },
          //         pitch: 0,
          //         bearing: 0,
          //         duration: 3000,
          //         essential: true,
          //       });
          //     });
          //     activity.addEventListener("mouseleave", (event) => {
          //       map.setPaintProperty(`route-${isoDate}`, 'line-opacity', .7).setPaintProperty(`route-${isoDate}`, 'line-width', 2);
          //       map.fitBounds(bboxCoordinates, {
          //         fitBoundsOptions: {
          //           padding: 25
          //         },
          //         pitch: 0,
          //         bearing: 0,
          //         duration: 2000,
          //         essential: true,
          //       });
          //     });
          //   }
          // });
        });
      }

    }
  }
})(window);
