import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import { lineString, bbox } from "@turf/turf";

(async (window) => {
  // console.dir(window.traces);

  // Load Mapbox map if necessary
  const mapElementId = "map";
  const mapElement = window.document.querySelector(`#${mapElementId}`);

  const MAX_ZOOM_LEVEL = 18;

  // https://carbondesignsystem.com/data-visualization/color-palettes/
  // const TRACE_COLORS_ON_LIGHT = ['#6929c4', '#1192e8', '#005d5d', '#9f1853', '#9f1853', '#570408', '#198038', '#002d9c', '#ee538b', '#b28600', '#009d9a', '#012749', '#8a3800', '#a56eff'];
  const TRACE_COLORS_ON_DARK = ['#8a3ffc', '#33b1ff', '#007d79', '#ff7eb6', '#fa4d56', '#fff1f1', '#6fdc8c', '#4589ff', '#d12771', '#d2a106', '#08bdba', '#bae6ff', '#ba4e00', '#d4bbff'];
  const TRACE_COLORS_BY_TYPE = {
    gravel: '#d12771',
    vélo: '#ee80af',
    marche: '#08bdba',
    tennis: '#d2a106',
    padel: '#f6d25e',
    'ski alpin': '#fff1f1'
  };

  const geoJsonDatas = window.traces;
  let allCoordinates = [];
  for (const [traceDate, geoJsonData] of Object.entries(geoJsonDatas)) {
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
      minZoom: 1,
      maxZoom: MAX_ZOOM_LEVEL,
      scrollZoom: true,
      attributionControl: true,
      cooperativeGestures: false, // https://docs.mapbox.com/mapbox-gl-js/example/cooperative-gestures/
      hash: false,
      renderWorldCopies: true,
    });

    map.on('load', () => {
      let traceIndex = 0;

      for (const [traceDate, geoJsonData] of Object.entries(geoJsonDatas)) {
        map.addSource(`trace-${traceDate}`, {
          type: "geojson",
          data: geoJsonData,
        });
        map.addLayer({
          'id': `route-${traceDate}`,
          'type': 'line',
          'source': `trace-${traceDate}`,
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': TRACE_COLORS_BY_TYPE[geoJsonData.features[0].properties.type] || TRACE_COLORS_ON_DARK[traceIndex % TRACE_COLORS_ON_DARK.length],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 25,
              16, 3
            ],
            'line-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              16, .7
            ],
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

      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          visualizePitch: true,
        }),
        "top-right",
      );

      // Add button to toggle between 2D and 3D views
      // Based on https://github.com/tobinbradley/mapbox-gl-pitch-toggle-control
      class PitchToggle {
        onAdd(map) {
          const div = document.createElement("div");
          div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
          div.innerHTML = `<button class="mapboxgl-ctrl-3d-toggle"><span class="mapboxgl-ctrl-icon" aria-hidden="true" aria-label="Toggle 3D"></span></button>`;
          if (map.getPitch() !== 0) {
            div
              .querySelector("button")
              .classList.toggle("mapboxgl-ctrl-3d-toggle-active", true);
          }
          div.addEventListener("contextmenu", (e) => e.preventDefault());
          div.addEventListener("click", () => {
            if (map.getPitch() === 0) {
              map.easeTo({ pitch: 70, bearing: -20 });
              div
                .querySelector("button")
                .classList.toggle("mapboxgl-ctrl-3d-toggle-active", true);
            } else {
              map.easeTo({ pitch: 0, bearing: 0 });
              div
                .querySelector("button")
                .classList.toggle("mapboxgl-ctrl-3d-toggle-active", false);
            }
          });

          return div;
        }
      }
      map.addControl(new PitchToggle());

      // Add button to toggle fullscreen mode
      map.addControl(new mapboxgl.FullscreenControl());

      // Add button to show filters
      class FilterActivities {
        onAdd(map) {
          const updateActivities = () => {
            const currentFilters = [];
            for (const input of div.querySelectorAll("input")) {
              if (input.checked) {
                currentFilters.push(input.id);
              }
            }

            for (const [traceDate, geoJsonData] of Object.entries(geoJsonDatas)) {
              // Show or hide activités based on active filters
              if (currentFilters.includes(geoJsonData.features[0].properties.type)) {
                // show
                map.setLayoutProperty(`route-${traceDate}`, 'visibility', 'visible');
              } else {
                // hide
                map.setLayoutProperty(`route-${traceDate}`, 'visibility', 'none');
              }
            }
          };

          let areFiltersShown = false;

          const div = document.createElement("div");
          div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
          div.innerHTML = `<button class="mapboxgl-ctrl-filters"><span class="mapboxgl-ctrl-icon" aria-hidden="true" aria-label="Filter activities"></span></button><ul class="filters">${window.types.map(type => `<li><label for="${type}"><input type="checkbox" id="${type}" checked /> <span class="name">${type}</span> <span class="color" style="background-color: ${TRACE_COLORS_BY_TYPE[type]}"></span></label></li>`).join('')}</ul>`;
          div.querySelectorAll("input").forEach((checkbox) => {
            checkbox.addEventListener("change", (e) => updateActivities());
          });
          div.querySelector("button").addEventListener("contextmenu", (e) => e.preventDefault());
          div.querySelector("button").addEventListener("click", () => {
            if (areFiltersShown) {
              // Hide the filters
              document.querySelector(".mapboxgl-ctrl-filters + ul").style.display = 'none';
            } else {
              // Show the filters
              document.querySelector(".mapboxgl-ctrl-filters + ul").style.display = 'block';
            }
            areFiltersShown = !areFiltersShown;
          });

          return div;
        }
      }
      map.addControl(new FilterActivities());

      // https://docs.mapbox.com/mapbox-gl-js/example/navigation-scale/
      map.addControl(new mapboxgl.ScaleControl());

      // window.document.querySelectorAll("ul.activites a").forEach((activity) => {
      //   const isoDate = activity.querySelector("time").getAttribute("datetime");
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
})(window);
