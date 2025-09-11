import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import { lineString, bbox } from "@turf/turf";
import { colorsOnDark, colorsByType } from '../../_data/colors.js';
import { route_settings } from './route-settings.js';
import { fetchGeojson } from "./fetch-geojson.js";

(async (window) => {
  // Load Mapbox map if necessary
  const mapElementId = "map";
  const mapElement = window.document.getElementById(mapElementId);

  const MAX_ZOOM_LEVEL = 18;

  const geoJsonDatas = window.traces;
  let allCoordinates = [];
  const allMonths = new Set();
  const allTypes = new Set();

  // Loop through all traces to collect useful data
  for (let [traceId, geoJsonData] of Object.entries(geoJsonDatas)) {
    const [date, type] = traceId.split('|');
    if (typeof geoJsonData === "string") {
      geoJsonData = await fetchGeojson(geoJsonData);
      geoJsonDatas[traceId] = geoJsonData;
    }
    allCoordinates = [...allCoordinates, ...geoJsonData.features[0].geometry.coordinates];
    allMonths.add(geoJsonData.features[0].properties.month);
    allTypes.add(type);
  }
  const bboxCoordinates = bbox(lineString(allCoordinates));

  // Sort months
  const sortedMonths = Array.from(allMonths).sort((a, b) => {
    return new Date(a) - new Date(b);
  });
  const readableMonths = sortedMonths.map((month) => {
    const date = new Date(month);
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  });
  const sliderMaxValue = sortedMonths.length - 1;

  const shownTypes = Array.from(allTypes.intersection(new Set(window.types)));
  shownTypes.sort((a, b) => window.types.indexOf(a) - window.types.indexOf(b));

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
      minZoom: 0,
      maxZoom: MAX_ZOOM_LEVEL,
      scrollZoom: true,
      attributionControl: true,
      cooperativeGestures: false, // https://docs.mapbox.com/mapbox-gl-js/example/cooperative-gestures/
      hash: true,
      renderWorldCopies: true,
      language: "fr",
    });

    map.on('load', () => {
      let traceIndex = 0;

      for (const [traceDate, geoJsonData] of Object.entries(geoJsonDatas)) {
        map.addSource(`trace-${traceDate}-shadow`, {
          type: "geojson",
          data: geoJsonData,
        });
        map.addLayer({
          'id': `route-${traceDate}-shadow`,
          'type': 'line',
          'source': `trace-${traceDate}-shadow`,
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
              14, 0,
              16, route_settings.route_width + route_settings.route_shadow_additional_width
            ],
            'line-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 0,
              16, route_settings.route_shadow_opacity
            ],
          }
        });

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
            'line-color': colorsByType[geoJsonData.features[0].properties.type] || colorsOnDark[traceIndex % colorsOnDark.length],
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
          let areFiltersShown = false;

          let fromMonth = 0;
          let toMonth = sliderMaxValue;

          // Function to update the visibility of activities based on selected filters
          const updateActivities = () => {
            let shownCoordinates = [];

            const currentFilters = [];
            for (const input of div.querySelectorAll("input")) {
              if (input.checked) {
                currentFilters.push(input.id);
              }
            }

            const currentMonths = sortedMonths.slice(fromMonth, toMonth + 1);

            for (const [traceDate, geoJsonData] of Object.entries(geoJsonDatas)) {
              // Show or hide activités based on active filters
              if (currentFilters.includes(geoJsonData.features[0].properties.type) && currentMonths.includes(geoJsonData.features[0].properties.month)) {
                // show
                map.setLayoutProperty(`route-${traceDate}-shadow`, 'visibility', 'visible');
                map.setLayoutProperty(`route-${traceDate}`, 'visibility', 'visible');
                shownCoordinates = [...shownCoordinates, ...geoJsonData.features[0].geometry.coordinates];
              } else {
                // hide
                map.setLayoutProperty(`route-${traceDate}-shadow`, 'visibility', 'none');
                map.setLayoutProperty(`route-${traceDate}`, 'visibility', 'none');
              }
            }

            const newBboxCoordinates = bbox(lineString(shownCoordinates));
            map.fitBounds(newBboxCoordinates, {
              fitBoundsOptions: {
                padding: 50
              },
              easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
              speed: .8,
              essential: true,
            });
          };

          const div = document.createElement("div");
          div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
          div.innerHTML = `
<button class="mapboxgl-ctrl-filters">
  <span class="mapboxgl-ctrl-icon" aria-hidden="true" aria-label="Filter activities"></span>
</button>
<div class="filters">
  <p>Types d'activités :</p>
  <ul class="types">
    ${shownTypes.map(type => `
    <li>
      <label for="${type}">
        <input type="checkbox" id="${type}" checked />
        <span class="name">${type}</span>
        <span class="color" style="background-color: ${colorsByType[type]}"></span>
      </label>
    </li>`).join('')}
  </ul>
  <div class="dates">
    <div class="labels">
      <label for="fromMonth">De</label>
      <output id="fromMonth"></output>
      <label for="toMonth">à</label>
      <output id="toMonth"></output>
    </div>
    <div class="sliders" role="group" aria-labelledby="multi-label">
      <div id="multi-label" class="visually-hidden">Sélecteur des mois de début et fin de période à afficher</div>
      <div class="track"></div>
      <input id="fromSlider" name="fromSlider" type="range" min="0" max="${sliderMaxValue}" step="1" value="0" />
      <input id="toSlider" name="toSlider" type="range" min="0" max="${sliderMaxValue}" step="1" value="${sliderMaxValue}" />
    </div>
  </div>
</div>
`;
          const filters = div.querySelector(".filters");
          const fromSlider = div.querySelector("#fromSlider");
          const toSlider = div.querySelector("#toSlider");
          const track = div.querySelector(".track");

          // Add event listeners to the type checkboxes
          div.querySelectorAll(".types input").forEach((checkbox) => {
            checkbox.addEventListener("change", () => updateActivities());
          });

          const updateSlidersLabels = () => {
            let needsUpdate = false;

            const newFromMonth = Number.parseInt(div.querySelector("#fromSlider").value, 10);
            div.querySelector("#fromMonth").textContent = readableMonths[newFromMonth];

            const newToMonth = Number.parseInt(div.querySelector("#toSlider").value, 10);
            div.querySelector("#toMonth").textContent = readableMonths[newToMonth];

            // Update the track background
            track.style.setProperty("--from", newFromMonth / sliderMaxValue);
            track.style.setProperty("--to", newToMonth / sliderMaxValue);

            if (newFromMonth !== fromMonth) {
              needsUpdate = true;
              fromMonth = newFromMonth;
            }
            if (newToMonth !== toMonth) {
              needsUpdate = true;
              toMonth = newToMonth;
            }

            if (needsUpdate) {
              updateActivities();
            }
          }
          fromSlider.addEventListener("input", () => {
            const fromValue = Number.parseInt(fromSlider.value, 10);
            const toValue = Number.parseInt(toSlider.value, 10);
            if (fromValue >= toValue) {
              fromSlider.value = toValue - 1; // Ensure "from" is always less than "to"
            }
            updateSlidersLabels();
          });
          toSlider.addEventListener("input", () => {
            const fromValue = Number.parseInt(fromSlider.value, 10);
            const toValue = Number.parseInt(toSlider.value, 10);
            if (toValue <= fromValue) {
              toSlider.value = fromValue + 1; // Ensure "to" is always greater than "from"
            }
            updateSlidersLabels();
          });

          updateSlidersLabels();

          // Manage filters visibility
          div.querySelector("button").addEventListener("contextmenu", (event) => event.preventDefault());
          div.querySelector("button").addEventListener("click", () => {
            if (areFiltersShown) {
              // Hide the filters
              filters.style.display = 'none';
            } else {
              // Show the filters
              filters.style.display = 'block';
            }
            areFiltersShown = !areFiltersShown;
          });

          return div;
        }
      }
      map.addControl(new FilterActivities());

      // Add button to show filters
      class Help {
        onAdd(map) {
          let isHelpShown = false;

          const div = document.createElement("div");
          div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
          div.innerHTML = `
<button class="mapboxgl-ctrl-help">
  <span class="mapboxgl-ctrl-icon" aria-hidden="true" aria-label="Help"></span>
</button>
<div class="help">
  <p>Raccourcis clavier :</p>
  <dl>
    <dt><kbd>=</kbd> ou <kbd>+</kbd></dt>
    <dd>Augmente le zoom</dd>
    <dt><kbd>-</kbd></dt>
    <dd>Diminue le zoom</dd>
    <dt><kbd>&larr;</kbd> ou <kbd>&uarr;</kbd> ou <kbd>&rarr;</kbd> ou <kbd>&darr;</kbd></dt>
    <dd>Déplacement</dd>
    <dt><kbd>Shift</kbd> et <kbd>&larr;</kbd> ou <kbd>&rarr;</kbd></dt>
    <dd>Rotation</dd>
    <dt><kbd>Shift</kbd> et <kbd>&uarr;</kbd> ou <kbd>&darr;</kbd></dt>
    <dd>Angle de vue</dd>
  </dl>
</div>
`;
          const help = div.querySelector(".help");

          // Manage help visibility
          div.querySelector("button").addEventListener("contextmenu", (event) => event.preventDefault());
          div.querySelector("button").addEventListener("click", () => {
            if (isHelpShown) {
              // Hide the help
              help.style.display = 'none';
            } else {
              // Show the help
              help.style.display = 'block';
            }
            isHelpShown = !isHelpShown;
          });

          return div;
        }
      }
      map.addControl(new Help());

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
})(window);
