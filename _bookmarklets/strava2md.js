// ==Bookmarklet==
// @name strava2md
// @description Extract data from a Strava activity page to create a new markdown file
// @version 1.0
// ==/Bookmarklet==

const months = {
  'janvier': '01',
  'février': '02',
  'mars': '03',
  'avril': '04',
  'mai': '05',
  'juin': '06',
  'juillet': '07',
  'août': '08',
  'septembre': '09',
  'octobre': '10',
  'novembre': '11',
  'décembre': '12'
};

/* **********************************************************************************
/* Get data from the page
/* *********************************************************************************/
const stravaUrl = window.location.href;

const contentRoot = window.document.getElementById('heading');
const activityInfo = contentRoot.querySelector('.details');
const activityStats = contentRoot.querySelector('.activity-stats');

const stravaType = contentRoot.querySelector('header .title').childNodes[2].nodeValue.replace(/\n+/g, "").trim().split('–')[1].trim();
let type = stravaType.toLowerCase();

const timeAndDate = activityInfo.querySelector('time').textContent.trim().split(',');
const date = timeAndDate[1].replace(/\sle\s[a-z]+\s([0-9]{1,2})\s([a-zéû]+)\s([0-9]{4})$/, (match, p1, p2, p3, offset, string) => {
  return `${p3}-${months[p2]}-${p1.padStart(2, '0')}`;
}).trim();
const time = timeAndDate[0].trim();

const title = activityInfo.querySelector('h1').textContent.trim();
if (title.toLowerCase().includes('padel')) {
  type = 'padel';
}

const description = activityInfo.querySelector('.activity-description .content')?.textContent.trim() || '';

const distance = activityStats.querySelector('strong:has(abbr[title="kilomètres"])')?.childNodes[0].nodeValue.replace(",", ".").trim() || '0';
let duration = activityStats.querySelector('li:has([data-glossary-term="definition-moving-time"]) strong')?.textContent.trim() || '00:00:00';
if (duration.split(':').length === 2) {
  duration = `00:${duration}`;
}
const elevation = activityStats.querySelector('strong:has(abbr[title="mètres"])')?.childNodes[0].nodeValue.trim().replace(/\s+/g, "") || '0';

let content = `---
title: ${title}
date: ${date} ${time}:00 +0${new Date(date).getTimezoneOffset() / -60}:00
type: ${type}`;

if (['tennis', 'padel', 'badminton'].includes(type)) {
  content += `
score: `;
}

content += `
duration: ${duration}
distance: ${distance}`;

if (!['tennis', 'padel', 'badminton'].includes(type)) {
  content += `
elevation: ${elevation}`;
}

content += `
tags: []
strava: ${stravaUrl}`;

if (!['tennis', 'padel', 'badminton'].includes(type)) {
  content += `
komoot:`;
}

content += `
squadrats:
  - url:
  - squadrats: 0
  - yard: 0
  - übersquadrat: 0
  - squadratinhos: 0
  - yardinho: 0
  - übersquadratinho: 0
---
\n${description} \n
  `;

navigator.clipboard.writeText(content);
