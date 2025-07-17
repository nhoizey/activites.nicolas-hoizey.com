import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
// import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import { lineString, bbox, bearing, point } from "@turf/turf";

(async (window) => {
  // Load Mapbox map if necessary
  const mapElementId = "map";
  const mapElement = window.document.querySelector(`#${mapElementId}`);

  const MAX_ZOOM_LEVEL = 18;
  const TRACE_COLOR = '#bd12f1';
  const SEGMENT_BASE_LENGTH = 20;
  const ANIMATED_POINTS_PER_SECOND = 5;

  // const mapStyles = [
  //   {
  //     title: "Satellite",
  //     uri: 'mapbox://styles/mapbox/standard-satellite',
  //   },
  //   {
  //     title: "Standard",
  //     uri: 'mapbox://styles/mapbox/standard',
  //   },
  // ];

  const geoJsonData = window.trace;
  const coordinates = geoJsonData.features[0].geometry.coordinates;
  const bboxCoordinates = bbox(lineString(coordinates));

  if (mapElement) {
    mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
      container: mapElementId,
      // style: `mapbox://styles/mapbox/standard${localStorage.getItem("mapStyle") === "Satellite" ? "-satellite" : ""}`,
      style: "mapbox://styles/mapbox/standard",
      projection: "globe",
      bounds: bboxCoordinates,
      fitBoundsOptions: {
        padding: 25
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
          'line-color': TRACE_COLOR,
          'line-width': 3,
          'line-opacity': 0.9
        }
      });

      map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': MAX_ZOOM_LEVEL
      });
      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 2 });

      const points = [];
      geoJsonData.features[0].properties.coordTimes.forEach((time, index) => {
        const pointCoordinates = coordinates[index];
        points.push({
          date: Date.parse(time),
          type: "point",
          coordinates: {
            longitude: pointCoordinates[0],
            latitude: pointCoordinates[1],
            altitude: pointCoordinates[2] || 0,
          },
        });
      });

      const photos = window.document.querySelectorAll(".photos figure");
      if (photos.length > 0) {
        photos.forEach((photo) => {
          const longitude = photo.getAttribute("data-longitude");
          const latitude = photo.getAttribute("data-latitude");
          if (longitude && latitude) {
            const imageElement = photo.querySelector("img");
            const src = imageElement.getAttribute("src");

            const photoPoint = {
              date: Date.parse(photo.querySelector('time').getAttribute("datetime")),
              type: "photo",
              coordinates: {
                longitude: Number.parseFloat(longitude),
                latitude: Number.parseFloat(latitude),
                altitude: 0,
              },
              innerHTML: photo.innerHTML,
            };
            points.push(photoPoint);

            // Create a DOM element for each marker.
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImage = `url(${src})`;

            // Add the marker to the map
            new mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(photo.innerHTML)
              )
              .addTo(map);
          }
        });
      }

      points.sort((a, b) => a.date - b.date);

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

      // Add buttons to switch between drawn map and satellite photography
      // map.addControl(
      //   new MapboxStyleSwitcherControl(mapStyles, {
      //     defaultStyle: localStorage.getItem("mapStyle") || "Satellite",
      //     eventListeners: {
      //       onChange: (_event, style) => {
      //         localStorage.setItem(
      //           "mapStyle",
      //           style.match(/satellite/) ? "Satellite" : "Terrain",
      //         );
      //         // map.setConfigProperty(style.match(/satellite/) ? "satellite" : "terrain", 'show3dObjects', false);
      //       },
      //     },
      //   }),
      // );

      class AutoPlayButton {
        onAdd(map) {
          let currentlyPlaying = false;

          let previousIndex = 0;
          let animation;
          let startTime = 0;
          let progress = 0;
          let resetTime = false;

          const animatedGeoJSON = {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'LineString',
                  'coordinates': [],
                }
              }
            ]
          };

          // Add dynamic source and layer
          map.addSource("trace-dyn", {
            'type': 'geojson',
            'data': animatedGeoJSON
          });
          map.addLayer({
            'id': 'route-dyn',
            'type': 'line',
            'source': 'trace-dyn',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': TRACE_COLOR,
              'line-width': 5,
              'line-opacity': 1
            }
          });


          function animateTrace(timestamp) {
            if (resetTime) {
              // resume previous progress
              startTime = performance.now() - progress;
              resetTime = false;
            } else {
              progress = timestamp - startTime;
            }

            const currentIndex = Math.max(0, Math.floor(progress * ANIMATED_POINTS_PER_SECOND / 1000));

            if (currentIndex !== previousIndex) {
              const easeToDuration = (currentIndex - previousIndex) / ANIMATED_POINTS_PER_SECOND * 1000;

              previousIndex = currentIndex;

              // strop animation if we reached the end of the points
              if (currentIndex >= coordinates.length) {
                cancelAnimationFrame(animation);
                resetTime = true;
                map.setLayoutProperty('route-dyn', 'visibility', 'none');
                map.setLayoutProperty('route', 'visibility', 'visible');

                map.fitBounds(bboxCoordinates, {
                  fitBoundsOptions: {
                    padding: 25
                  },
                  pitch: 0,
                  bearing: 0,
                  duration: 2000,
                  essential: true,
                });

                currentlyPlaying = false;
                div
                  .querySelector("button")
                  .classList.toggle(
                    "mapboxgl-ctrl-autoplay-active",
                    currentlyPlaying,
                  );


                // TODO: reset play button
              } else {
                animatedGeoJSON.features[0].geometry.coordinates = coordinates.slice(0, currentIndex);
                map.getSource('trace-dyn').setData(animatedGeoJSON);

                // Find the segment of points around the current index
                const currentSegment = coordinates.slice(Math.max(0, currentIndex - SEGMENT_BASE_LENGTH), Math.min(coordinates.length - 1, currentIndex + SEGMENT_BASE_LENGTH * 2)).map(point => point.slice(0, 2));

                // Find the bearing angle between the extremes of the current segment
                const bearingAngle = bearing(point(currentSegment[0]), point(currentSegment[currentSegment.length - 1]));

                // Move the map to the new point
                map.fitBounds(bbox(lineString(currentSegment)), {
                  pitch: 60,
                  bearing: bearingAngle,
                  duration: easeToDuration,
                  essential: true, // This animation is considered essential with respect to &prefers-reduced-motion
                });
              }
            }
            // Request the next frame of the animation.
            animation = requestAnimationFrame(animateTrace);
          };

          // const flyToNextPoint = () => {
          //   // if (popup) {
          //   //   popup.remove();
          //   //   popup = null;
          //   // }

          //   // Either use the direction embedded in the photo's metadata, or a random variation from previous bearing
          //   // bearing =
          //   //   photoData.geometry.direction ||
          //   //   (bearing + Math.random() * 60 - 30) % 360; // 360 degrees starting from North


          //     // if (popup) {
          //     //   popup.remove();
          //     //   popup = null;
          //     // }

          //     // popup = new AnimatedPopup({
          //     //   openingAnimation: POPUP_OPENING_ANIMATION,
          //     //   closingAnimation: POPUP_CLOSING_ANIMATION,
          //     //   offset: 20,
          //     //   closeButton: false,
          //     //   maxWidth: `${Math.floor(targetWidth)}px`,
          //     //   className: `autoplay ${photoProperties.height / photoProperties.width > 1 ? "portrait" : "landscape"}`,
          //     // })
          //     //   .setLngLat(photoData.geometry.coordinates)
          //     //   .setHTML(
          //     //     `<a href="${photoProperties.url}"><img src="/photos/${photoProperties.slug}/small.jpg" width="${targetWidth}" height="${targetHeight}" alt>${photoProperties.title}</a>`,
          //     //   )
          //     //   .addTo(map);

          const div = document.createElement("div");
          div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
          div.innerHTML = `<button class="mapboxgl-ctrl-autoplay"><span class="mapboxgl-ctrl-icon" aria-hidden="true" title="Auto play"></span></button>`;
          div.addEventListener("contextmenu", (e) => e.preventDefault());
          div.addEventListener("click", () => {
            currentlyPlaying = !currentlyPlaying;

            if (currentlyPlaying) {
              map.setLayoutProperty('route', 'visibility', 'none');
              map.setLayoutProperty('route-dyn', 'visibility', 'visible');

              const currentIndex = Math.max(0, Math.floor(progress * ANIMATED_POINTS_PER_SECOND / 1000))
              map.easeTo({
                center: coordinates.slice(currentIndex, currentIndex + 1)[0].slice(0, 2),
                zoom: 16, // TODO: adapt zoom level based on speed
                pitch: 60,
                bearing: bearing(point([points[Math.max(0, currentIndex - 20)].coordinates.longitude, points[Math.max(0, currentIndex - 20)].coordinates.latitude]), point([points[Math.min(points.length - 1, currentIndex + 20)].coordinates.longitude, points[Math.min(points.length - 1, currentIndex + 20)].coordinates.latitude])),
                duration: 500,
                essential: true, // This animation is considered essential with respect to &prefers-reduced-motion
              });

              resetTime = true;
              setTimeout(animateTrace, 1000);
            } else {
              cancelAnimationFrame(animation);

              map.fitBounds(bboxCoordinates, {
                fitBoundsOptions: {
                  padding: 25
                },
                pitch: 0,
                bearing: 0,
                duration: 2000,
                essential: true, // This animation is considered essential with respect to &prefers-reduced-motion
              });

              map.setLayoutProperty('route-dyn', 'visibility', 'none');
              map.setLayoutProperty('route', 'visibility', 'visible');
            }

            div
              .querySelector("button")
              .classList.toggle(
                "mapboxgl-ctrl-autoplay-active",
                currentlyPlaying,
              );
          });

          return div;
        }
      }
      map.addControl(new AutoPlayButton());

      // https://docs.mapbox.com/mapbox-gl-js/example/navigation-scale/
      map.addControl(new mapboxgl.ScaleControl());

    //   map.addControl(
    //     new GlobeMinimap({
    //       globeSize: Math.min(100, window.innerWidth / 10),
    //     }),
    //     "bottom-right",
    //   );
    });
  }
})(window);
