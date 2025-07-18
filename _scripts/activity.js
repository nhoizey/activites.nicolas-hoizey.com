#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { sharedSlugify } from '../node_modules/eleventy-plugin-pack11ty/_11ty/utils/slugify.js';

const argv = yargs(hideBin(process.argv))
  .locale('en')
  .usage('Usage: $0 <command> [options]')
  .command('* <title> [date]', 'add an activity', (yargs) => {
    yargs
      .positional('title', {
        describe: 'Title of the activity',
        type: 'string',
        demandOption: true,
      })
      .positional('date', {
        describe: 'Date of the activity',
        type: 'string',
        default: new Date().toISOString().split('T')[0]
      })
  })
  .example('$0 "activity title" 2025-07-18', 'create a new activity with title and date')
  .version('1.0')
  .parse();

const slug = sharedSlugify(argv.title);
const folder = path.join('./src/collections/activites/', argv.date.replaceAll('-', '/'), slug);
const file = path.join(folder, 'index.md');
const content = `---
title: ${argv.title}
date: ${argv.date}
type:
duration:
distance:
tags: []
strava:
komoot:
---

`;

if (fs.existsSync(folder)) {
  console.error(`Activity folder already exists: ${folder}`);
  process.exit(1);
}

['', 'photos', 'sources'].forEach(subfolder => {
  const subfolderPath = path.join(folder, subfolder);
  if (!fs.existsSync(subfolderPath)) {
    fs.mkdirSync(subfolderPath, { recursive: true });
  }
});

fs.writeFileSync(file, content, 'utf8');
console.log(`Activity created at: ${folder}`);

execSync(`code ${file}`);
