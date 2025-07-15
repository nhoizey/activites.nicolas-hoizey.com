import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import { lineString, bbox } from "@turf/turf";

(async (window) => {
  // Load Mapbox map if necessary
  const mapElementId = "map";
  const mapElement = window.document.querySelector(`#${mapElementId}`);
  const maxZoomLevel = 18;
  const markerStroke = "#ffffff";

  const geoJsonData = window.trace;
  window.geoJsonFeatures = geoJsonData.features;

  let bearing = 0;
  let pitch = 45; // Start with a default pitch angle

  if (mapElement) {
    mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
      container: mapElementId,
      style: 'mapbox://styles/mapbox/standard',
      projection: "globe",
      bounds: bbox(lineString(geoJsonData.features[0].geometry.coordinates)),
      fitBoundsOptions: {
        padding: 25
      },
      minZoom: 1,
      maxZoom: maxZoomLevel,
      scrollZoom: true,
      attributionControl: false,
      cooperativeGestures: false, // https://docs.mapbox.com/mapbox-gl-js/example/cooperative-gestures/
      hash: true,
      renderWorldCopies: true,
    });

    map.on('load', () => {
      map.addSource("trace", {
        type: "geojson",
        data: geoJsonData,
      });

      map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'trace',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#e9b33d',
          'line-width': 3
        }
      });

      // const addControls = () => {
      //   // Add navigation controls

    });
    //   map.addControl(
    //     new mapboxgl.NavigationControl({
    //       showCompass: true,
    //       visualizePitch: true,
    //     }),
    //     "top-right",
    //   );

    //   // Add button to toggle between 2D and 3D views
    //   // Based on https://github.com/tobinbradley/mapbox-gl-pitch-toggle-control
    //   class PitchToggle {
    //     onAdd(map) {
    //       const div = document.createElement("div");
    //       div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    //       div.innerHTML = `<button class="mapboxgl-ctrl-3d-toggle"><span class="mapboxgl-ctrl-icon" aria-hidden="true" aria-label="Toggle 3D"></span></button>`;
    //       if (map.getPitch() !== 0) {
    //         div
    //           .querySelector("button")
    //           .classList.toggle("mapboxgl-ctrl-3d-toggle-active", true);
    //       }
    //       div.addEventListener("contextmenu", (e) => e.preventDefault());
    //       div.addEventListener("click", () => {
    //         if (map.getPitch() === 0) {
    //           map.easeTo({ pitch: 70, bearing: -20 });
    //           div
    //             .querySelector("button")
    //             .classList.toggle("mapboxgl-ctrl-3d-toggle-active", true);
    //         } else {
    //           map.easeTo({ pitch: 0, bearing: 0 });
    //           div
    //             .querySelector("button")
    //             .classList.toggle("mapboxgl-ctrl-3d-toggle-active", false);
    //         }
    //       });

    //       return div;
    //     }
    //   }
    //   map.addControl(new PitchToggle());

    //   // Add button to allow users to find their location
    //   map.addControl(
    //     new mapboxgl.GeolocateControl({
    //       positionOptions: {
    //         enableHighAccuracy: true,
    //       },
    //       // When active the map will receive updates to the device's location as it changes.
    //       trackUserLocation: true,
    //       // Draw an arrow next to the location dot to indicate which direction the device is heading.
    //       showUserHeading: true,
    //     }),
    //   );

    //   // Add button to toggle fullscreen mode
    //   map.addControl(new mapboxgl.FullscreenControl());

    //   // Add buttons to switch between drawn map and satellite photography
    //   const mapStyles = [
    //     {
    //       title: "Satellite",
    //       uri: `${window.location.origin}/map/mapbox-style-satellite.json`,
    //     },
    //     {
    //       title: "Terrain",
    //       uri: `${window.location.origin}/map/mapbox-style-terrain.json`,
    //     },
    //   ];
    //   map.addControl(
    //     new MapboxStyleSwitcherControl(mapStyles, {
    //       defaultStyle: localStorage.getItem("mapStyle") || "Satellite",
    //       eventListeners: {
    //         onChange: (_event, style) => {
    //           localStorage.setItem(
    //             "mapStyle",
    //             style.match(/satellite/) ? "Satellite" : "Terrain",
    //           );
    //           // map.setConfigProperty(style.match(/satellite/) ? "satellite" : "terrain", 'show3dObjects', false);
    //           addLayers();
    //         },
    //       },
    //     }),
    //   );

    //   class AutoPlayButton {
    //     onAdd(map) {
    //       let currentlyPlaying = false;
    //       let currentPhotoIndex =
    //         Number.parseInt(localStorage.getItem("currentPhotoIndex"), 10) || 0;
    //       // let intervalID = null;

    //       const flyToNextPhoto = () => {
    //         if (popup) {
    //           popup.remove();
    //           popup = null;
    //         }

    //         const photoData = window.geoJsonFeatures[currentPhotoIndex];
    //         const photoProperties = photoData.properties;

    //         // Calculate target height and width based on the aspect ratio
    //         const ratio = photoProperties.width / photoProperties.height;
    //         // Ensure the target height does not exceed 40% of the viewport height
    //         let targetHeight = Math.min(
    //           Math.sqrt(SMALL_VERSION_PIXELS / ratio),
    //           window.innerHeight * 0.5,
    //         );
    //         let targetWidth = ratio * targetHeight;

    //         // Ensure the target width does not exceed 40% of the viewport width
    //         // This is to prevent the popup from being too large on smaller screens
    //         if (targetWidth > window.innerWidth * 0.8) {
    //           targetWidth = window.innerWidth * 0.8;
    //           targetHeight = targetWidth / ratio;
    //         }

    //         // Either use the direction embedded in the photo's metadata, or a random variation from previous bearing
    //         bearing =
    //           photoData.geometry.direction ||
    //           (bearing + Math.random() * 60 - 30) % 360; // 360 degrees starting from North
    //         // console.log(`Bearing: ${bearing}`);

    //         // Use a random pitch variation from previous one, but ensure it stays within 30 to 60 degrees
    //         pitch = Math.max(
    //           PITCH_MIN,
    //           Math.min(
    //             PITCH_MAX,
    //             pitch + Math.random() * PITCH_STEP * 2 - PITCH_STEP,
    //           ),
    //         ); // 0 (zenith) -> 90 degrees
    //         // console.log(`Pitch: ${pitch}`);

    //         flying = true;
    //         map.flyTo({
    //           center: photoData.geometry.coordinates,
    //           padding: FLY_TO_PADDING,
    //           zoom: 16,
    //           pitch: pitch,
    //           bearing: bearing,
    //           curve: 2,
    //           speed: FLY_SPEED,
    //           essential: true, // This animation is considered essential with respect to &prefers-reduced-motion
    //         });

    //         // End of flight when the map has stopped moving
    //         map.once("moveend", () => {
    //           flying = false;

    //           if (popup) {
    //             popup.remove();
    //             popup = null;
    //           }

    //           popup = new AnimatedPopup({
    //             openingAnimation: POPUP_OPENING_ANIMATION,
    //             closingAnimation: POPUP_CLOSING_ANIMATION,
    //             offset: 20,
    //             closeButton: false,
    //             maxWidth: `${Math.floor(targetWidth)}px`,
    //             className: `autoplay ${photoProperties.height / photoProperties.width > 1 ? "portrait" : "landscape"}`,
    //           })
    //             .setLngLat(photoData.geometry.coordinates)
    //             .setHTML(
    //               `<a href="${photoProperties.url}"><img src="/photos/${photoProperties.slug}/small.jpg" width="${targetWidth}" height="${targetHeight}" alt>${photoProperties.title}</a>`,
    //             )
    //             .addTo(map);

    //           if (currentlyPlaying) {
    //             setTimeout(flyToNextPhoto, FLY_INTERVAL);
    //           }
    //         });

    //         currentPhotoIndex =
    //           (currentPhotoIndex + 1) % window.geoJsonFeatures.length;
    //         localStorage.setItem("currentPhotoIndex", currentPhotoIndex);
    //       };

    //       const div = document.createElement("div");
    //       div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    //       div.innerHTML = `<button class="mapboxgl-ctrl-autoplay"><span class="mapboxgl-ctrl-icon" aria-hidden="true" title="Auto play"></span></button>`;
    //       div.addEventListener("contextmenu", (e) => e.preventDefault());
    //       div.addEventListener("click", () => {
    //         currentlyPlaying = !currentlyPlaying;

    //         if (currentlyPlaying) {
    //           flyToNextPhoto();
    //         }

    //         div
    //           .querySelector("button")
    //           .classList.toggle(
    //             "mapboxgl-ctrl-autoplay-active",
    //             currentlyPlaying,
    //           );
    //       });

    //       return div;
    //     }
    //   }
    //   map.addControl(new AutoPlayButton());

    //   // https://docs.mapbox.com/mapbox-gl-js/example/navigation-scale/
    //   map.addControl(new mapboxgl.ScaleControl());

    //   map.addControl(
    //     new GlobeMinimap({
    //       globeSize: Math.min(100, window.innerWidth / 10),
    //     }),
    //     "bottom-right",
    //   );
    // };

  }
})(window);
