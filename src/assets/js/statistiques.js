import {
  areaY,
  axisX,
  barY,
  dot,
  frame,
  group,
  groupX,
  hexagon,
  hexbin,
  lineY,
  plot,
  pointer,
  ruleX,
  ruleY,
  tip,
} from "@observablehq/plot";

// https://observablehq.com/@observablehq/plot-cheatsheets-colors
const colorSchemes = {
  'linear': 'ylgn',
  'categorical': 'Category10'
};

const graphRatio = 4 / 3;
const maxHeight = Math.min(window.innerHeight - 32, 600);
const graphWidth = Math.min(window.document.querySelector('main').offsetWidth - 32, 800, maxHeight * graphRatio);

const graphLayout = {
  width: graphWidth,
  height: graphWidth / graphRatio,
  marginTop: 32,
  inset: 32,
  fontSize: 14
}

const generateStats = async () => {
  const activitiesData = await fetch("/api/activites.json").then((response) =>
    response.json(),
  );

  /* **************************************************************************
   * Prepare data
   * *********************************************************************** */

  const activityFamilies = new Set();
  for (const activity of activitiesData) {
    activityFamilies.add(activity.type_family);
  }

  const yearMonthFamilySums = {};
  for (const activity of activitiesData) {
    const key = `${activity.year_month}|${activity.type_family}`;
    if (yearMonthFamilySums[key] === undefined) {
      yearMonthFamilySums[key] = { year_month: activity.year_month, family: activity.type_family, distance: 0, duration: 0, elevation: 0 };
    }
    yearMonthFamilySums[key].distance += activity.distance || 0;
    yearMonthFamilySums[key].duration += activity.duration || 0;
    yearMonthFamilySums[key].elevation += activity.elevation || 0;
  }

  /* **************************************************************************
   * Define graphs
   * *********************************************************************** */

  const plotActivitiesNumberYear = plot({
    width: graphLayout.width,
    height: graphLayout.height,
    marginTop: graphLayout.marginTop,
    marginBottom: 60,
    insetBottom: 0,
    insetLeft: 0,
    style: {
      fontSize: graphLayout.fontSize,
    },
    x: {
      label: "Années",
      tickRotate: 90
    },
    y: {
      label: "Nombre d'activités",
      grid: true
    },
    color: {
      type: "linear",
      scheme: colorSchemes.linear,
    },
    marks: [
      barY(activitiesData, groupX({ y: "count", fill: "count" }, {
        x: "year",
      })),
      ruleX([0]),
      ruleY([0]),
    ]
  });
  document.getElementById("activities_number_year").append(plotActivitiesNumberYear);

  const plotActivitiesNumberYearMonth = plot({
    width: graphLayout.width,
    height: graphLayout.height,
    marginTop: graphLayout.marginTop,
    marginBottom: 60,
    insetBottom: 0,
    insetLeft: graphLayout.inset,
    fontSize: graphLayout.fontSize,
    x: {
      label: "Année",
      tickRotate: 90,
    },
    y: {
      label: "Mois",
      grid: true,
    },
    color: {
      type: "linear",
      scheme: colorSchemes.linear,
    },
    marks: [
      dot(
        activitiesData,
        group({ r: "count", fill: "count" }, { x: "year", y: "month" }),
      ),
      tip(
        activitiesData,
        pointer({
          x: "year",
          y: "month",
          // title: (d) => `${d.r} activités durant le mois ${d.month} de ${d.year}`,
          fontSize: graphLayout.fontSize
        }),
      ),
    ],
  });
  document.getElementById("activities_number_year_month").append(plotActivitiesNumberYearMonth);

  const plotActivitiesNumberMonth = plot({
    width: graphLayout.width,
    height: graphLayout.height,
    marginTop: graphLayout.marginTop,
    marginBottom: 50,
    insetBottom: 0,
    insetLeft: 0,
    fontSize: graphLayout.fontSize,
    x: {
      label: "Mois, toutes années confondues",
      tickRotate: 90
    },
    y: {
      label: "Nombre d'activités",
      grid: true
    },
    color: {
      type: "linear",
      scheme: colorSchemes.linear,
    },
    marks: [
      barY(activitiesData, groupX({ y: "count", fill: "count" }, { x: "month" })),
      ruleX([0]),
      ruleY([0]),
    ],
  });
  document.getElementById("activities_number_month").append(plotActivitiesNumberMonth);

  const plotActivitiesFamily = plot({
    width: graphLayout.width,
    height: graphLayout.height,
    marginTop: graphLayout.marginTop,
    marginBottom: 80,
    insetBottom: 0,
    insetLeft: graphLayout.inset,
    fontSize: graphLayout.fontSize,
    x: {
      label: "Famille d'activité",
      tickRotate: 90
    },
    y: {
      label: "Nombre d'activités",
    },
    color: {
      type: "categorical",
      scheme: colorSchemes.categorical,
      label: "Type family",
      legend: true,
    },
    marks: [
      barY(
        activitiesData.filter((activity) => activity.type_family),
        groupX(
          { y: "count" },
          {
            x: "type_family",
            sort: { x: "y", reverse: true },
            fill: "type_family",
          },
        ),
      ),
      ruleX([0]),
      ruleY([0]),
    ],
  });
  document.getElementById("activities_family").append(plotActivitiesFamily);

  const plotActivitiesType = plot({
    width: graphLayout.width,
    height: graphLayout.height,
    marginTop: graphLayout.marginTop,
    marginBottom: 80,
    insetBottom: 0,
    insetLeft: graphLayout.inset,
    fontSize: graphLayout.fontSize,
    x: {
      label: "Type d'activité",
      tickRotate: 90
    },
    y: {
      label: "Nombre d'activités",
    },
    color: {
      type: "categorical",
      scheme: colorSchemes.categorical,
      label: "Type",
      legend: true,
    },
    marks: [
      barY(
        activitiesData.filter((activity) => activity.type_family),
        groupX(
          { y: "count" },
          {
            x: "type",
            sort: { x: "y", reverse: true },
            fill: "type",
          },
        ),
      ),
      ruleX([0]),
      ruleY([0]),
    ],
  });
  document.getElementById("activities_type").append(plotActivitiesType);

  // https://observablehq.com/plot/transforms/stack
  const plotActivitiesDuration = plot({
    width: graphLayout.width,
    height: graphLayout.height,
    marginTop: graphLayout.marginTop,
    marginBottom: 60,
    insetBottom: 0,
    insetLeft: 0,
    style: {
      fontSize: graphLayout.fontSize,
    },
    x: {
      label: "Mois",
      tickRotate: 90
    },
    y: {
      label: "Durée par famille",
      grid: true
    },
    color: {
      // type: "linear",
      // scheme: colorSchemes.linear,
    },
    marks: [
      areaY(yearMonthFamilySums, {
        x: "year_month",
        y: (d) => d.duration / 3600,
        z: "family",
        fill: "group",
        order: "appearance"
      }),
      ruleX([0]),
      ruleY([0]),
    ]
  });
  document.getElementById("activities_duration").append(plotActivitiesDuration);


  // const photosPerYearAndBrand = plot({
  //   marginBottom: 50,
  //   marginTop: 50,
  //   x: { tickRotate: 90 },
  //   y: { grid: true },
  //   style: {
  //     background: "#292929",
  //     color: "#ffffff",
  //   },
  //   color: {
  //     type: "categorical",
  //     scheme: "Category10",
  //     label: "Camera brand",
  //     legend: true,
  //   },
  //   marks: [
  //     barY(
  //       activitiesData.filter((photo) => photo.camera_brand),
  //       group(
  //         { y: "count" },
  //         { x: "year", y: "count", fill: "camera_brand", tip: "x" },
  //       ),
  //     ),
  //     ruleY([0]),
  //   ],
  // });
  // document
  //   .getElementById("photos_by_year_and_brand")
  //   .append(photosPerYearAndBrand);

  // const photosPerCamera = plot({
  //   marginBottom: 130,
  //   marginTop: 30,
  //   y: {
  //     label: "↑ Count of photos by camera",
  //   },
  //   color: {
  //     type: "categorical",
  //     scheme: "Category10",
  //     label: "Camera",
  //     legend: true,
  //   },
  //   marks: [
  //     barY(
  //       activitiesData.filter((photo) => photo.camera),
  //       groupX(
  //         { y: "count" },
  //         { x: "camera", sort: { x: "y", reverse: true }, fill: "camera" },
  //       ),
  //     ),
  //     axisX({ tickRotate: 90, lineWidth: 9 }),
  //   ],
  // });
  // document.getElementById("photos_by_camera").append(photosPerCamera);

  // const photosPerYearAndCamera = plot({
  //   marginBottom: 50,
  //   marginTop: 50,
  //   x: { tickRotate: 90 },
  //   y: { grid: true },
  //   color: {
  //     type: "categorical",
  //     scheme: "Category10",
  //     label: "Camera brand",
  //     legend: true,
  //   },
  //   marks: [
  //     barY(
  //       activitiesData.filter((photo) => photo.camera),
  //       group({ y: "count" }, { x: "year", y: "count", fill: "camera" }),
  //     ),
  //     ruleY([0]),
  //   ],
  // });
  // document
  //   .getElementById("photos_by_year_and_camera")
  //   .append(photosPerYearAndCamera);

  // const focalLengths = plot({
  //   marginBottom: 50,
  //   x: { tickRotate: 90 },
  //   y: { grid: true },
  //   color: {
  //     type: "linear",
  //     scheme: "Purples",
  //   },
  //   marks: [
  //     barY(
  //       activitiesData,
  //       groupX({ y: "count", fill: "count" }, { x: "focal_length" }),
  //     ),
  //     ruleY([0]),
  //   ],
  // });
  // document.getElementById("focal_lengths").append(focalLengths);

  // const apertures = plot({
  //   marginBottom: 50,
  //   x: { tickRotate: 90 },
  //   y: { grid: true },
  //   color: {
  //     type: "linear",
  //     scheme: "Purples",
  //   },
  //   marks: [
  //     barY(
  //       activitiesData,
  //       groupX({ y: "count", fill: "count" }, { x: "aperture" }),
  //     ),
  //     ruleY([0]),
  //   ],
  // });
  // document.getElementById("apertures").append(apertures);

  // const isos = plot({
  //   marginBottom: 50,
  //   x: { tickRotate: 90 },
  //   y: { grid: true },
  //   color: {
  //     type: "linear",
  //     scheme: "Purples",
  //   },
  //   marks: [
  //     barY(activitiesData, groupX({ y: "count", fill: "count" }, { x: "iso" })),
  //     ruleY([0]),
  //   ],
  // });
  // document.getElementById("isos").append(isos);

  // const shutterSpeeds = plot({
  //   marginBottom: 50,
  //   x: { tickRotate: 90 },
  //   y: { grid: true },
  //   color: {
  //     type: "linear",
  //     scheme: "Purples",
  //   },
  //   marks: [
  //     barY(
  //       activitiesData,
  //       groupX({ y: "count", fill: "count" }, { x: "shutter_speed" }),
  //     ),
  //     ruleY([0]),
  //   ],
  // });
  // document.getElementById("shutter_speeds").append(shutterSpeeds);

  // const aperturesPerYear = plot({
  //   marginBottom: 50,
  //   marginTop: 50,
  //   y: { grid: true },
  //   color: {
  //     type: "linear",
  //     scheme: "Warm",
  //   },
  //   marks: [
  //     dot(
  //       activitiesData,
  //       group({ r: "count", fill: "count" }, { x: "year", y: "aperture" }),
  //     ),
  //     ruleY([0]),
  //     tip(
  //       activitiesData,
  //       pointer({
  //         x: "year",
  //         y: "aperture",
  //         title: (d) => `aperture ${d.readable_aperture} in ${d.year}`,
  //       }),
  //     ),
  //   ],
  // });
  // document.getElementById("apertures_by_year").append(aperturesPerYear);

  // const shutterSpeedsPerYear = plot({
  //   marginBottom: 50,
  //   marginTop: 50,
  //   y: { type: "log", grid: true },
  //   color: {
  //     type: "linear",
  //     scheme: "Warm",
  //   },
  //   marks: [
  //     dot(
  //       activitiesData,
  //       group({ r: "count", fill: "count" }, { x: "year", y: "shutter_speed" }),
  //     ),
  //     ruleY([0]),
  //     tip(
  //       activitiesData,
  //       pointer({
  //         x: "year",
  //         y: "shutter_speed",
  //         title: (d) =>
  //           `shutter speed ${d.readable_shutter_speed} in ${d.year}`,
  //       }),
  //     ),
  //   ],
  // });
  // document
  //   .getElementById("shutter_speeds_by_year")
  //   .append(shutterSpeedsPerYear);

  // const isosPerYear = plot({
  //   marginBottom: 50,
  //   marginTop: 50,
  //   y: { grid: true },
  //   color: {
  //     type: "linear",
  //     scheme: "Warm",
  //   },
  //   marks: [
  //     dot(
  //       activitiesData,
  //       group({ r: "count", fill: "count" }, { x: "year", y: "iso" }),
  //     ),
  //     ruleY([0]),
  //     tip(
  //       activitiesData,
  //       pointer({
  //         x: "year",
  //         y: "iso",
  //         title: (d) => `ISO ${d.readable_iso} in ${d.year}`,
  //       }),
  //     ),
  //   ],
  // });
  // document.getElementById("isos_by_year").append(isosPerYear);

  // const aperturesAndShutterSpeeds = plot({
  //   inset: 20,
  //   marginBottom: 50,
  //   marginTop: 50,
  //   y: { type: "log", grid: true },
  //   color: {
  //     type: "linear",
  //     scheme: "Warm",
  //   },
  //   marks: [
  //     frame(),
  //     dot(
  //       activitiesData,
  //       group(
  //         { r: "count", fill: "count" },
  //         { x: "aperture", y: "shutter_speed" },
  //       ),
  //     ),
  //     ruleY([0]),
  //     tip(
  //       activitiesData,
  //       pointer({
  //         x: "aperture",
  //         y: "shutter_speed",
  //         title: (d) => `${d.readable_shutter_speed} at ${d.readable_aperture}`,
  //       }),
  //     ),
  //   ],
  // });
  // document
  //   .getElementById("apertures_and_shutter_speeds")
  //   .append(aperturesAndShutterSpeeds);

  // const aperturesAndShutterSpeeds2 = plot({
  //   inset: 20,
  //   marginBottom: 50,
  //   marginTop: 50,
  //   y: { type: "log", grid: true },
  //   color: {
  //     type: "linear",
  //     scheme: "YlOrRd",
  //   },
  //   marks: [
  //     frame(),
  //     hexagon(
  //       activitiesData,
  //       hexbin(
  //         { fill: "count" },
  //         { x: "aperture", y: "shutter_speed", symbol: "square" },
  //       ),
  //     ),
  //   ],
  // });
  // document
  //   .getElementById("apertures_and_shutter_speeds_2")
  //   .append(aperturesAndShutterSpeeds2);

  // const isosPerCamera = plot({
  //   inset: 20,
  //   marginBottom: 120,
  //   marginTop: 50,
  //   y: { grid: true },
  //   color: {
  //     type: "linear",
  //     scheme: "Warm",
  //   },
  //   marks: [
  //     frame(),
  //     dot(
  //       activitiesData,
  //       group({ r: "count", fill: "count" }, { x: "camera", y: "iso" }),
  //     ),
  //     axisX({ tickRotate: 90, lineWidth: 9 }),
  //   ],
  // });
  // document.getElementById("isos_by_camera").append(isosPerCamera);
};

generateStats();
