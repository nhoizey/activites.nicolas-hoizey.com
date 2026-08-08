#!/usr/bin/env node

import { existsSync, mkdir } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";
// Load .env variables with dotenv
// biome-ignore lint/correctness/noUnusedImports: dotenv
import {} from "dotenv/config";
import glob from "fast-glob";
import { Cluster } from "puppeteer-cluster";
import puppeteer from "puppeteer-core";

// const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

(async () => {
	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_BROWSER,
		maxConcurrency: 5,
		workerCreationDelay: 1000,
		retryLimit: 5,
		retryDelay: 10000,
		timeout: 50000,
		monitor: true,
		puppeteer: puppeteer,
		puppeteerOptions: {
			executablePath:
				"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		},
	});

	await cluster.task(async ({ page, data: resourcePath }) => {
		await page.setViewport({
			width: 1440,
			height: 800,
			deviceScaleFactor: 1,
		});
		await page.setDefaultNavigationTimeout(50000);

		const folder = path.join("./src/_cache/opengraph/collections", resourcePath);

		// Create the folder if it does not exist
		if (!existsSync(folder)) {
			await mkdir(folder, { recursive: true }, (err) => {
				if (err) throw err;
			});
		}

		const file = path.join(folder, "opengraph.jpg");
		const fileExists = await access(file)
			.then(() => true)
			.catch(() => false);
		if (fileExists) {
			// TODO: automate opengraph image update if new content in sub elements
			// const lastModified = await stat(file).then((stats) => stats.mtimeMs);
			// const ageInDays = (new Date().getTime() - lastModified) / ONE_DAY_IN_MS;
			// if (resourcePath.match(/^photos\//) || ageInDays < 14) {
			// Renew galleries' opengraph images after 14 days
			return;
			// }
		}

		const opengraphUrl = `http://localhost:8080/${resourcePath.replace(
			/^(collections|pages)\//,
			"",
		)}/opengraph.html`;

		console.log(`Get opengraph image from ${opengraphUrl}`);

		await page.goto(opengraphUrl, { waitUntil: "networkidle0", timeout: 0 });

		// Save a screenshot of the opengraph image
		const element = await page.$("#opengraph");
		if (element) {
			await element.screenshot({
				path: file,
				type: "jpeg",
			});
		}
	});

	// In case of problems, log them
	cluster.on("taskerror", (err, data) => {
		console.log(`  Error with ${data}: ${err.message}`);
	});

	// Get the list of activities
	const activites = await glob(["activites/*/*/*/*"], {
		cwd: "src/collections/",
		onlyDirectories: true,
	});

	// Queue processing of all activities
	for (const resourcePath of activites) {
		cluster.queue(resourcePath);
	}

	// Get the list of recits
	const recits = await glob(["recits/*/*/*/*"], {
		cwd: "src/collections/",
		onlyDirectories: true,
	});

	// Queue processing of all recits
	for (const resourcePath of recits) {
		cluster.queue(resourcePath);
	}

	await cluster.idle();
	await cluster.close();
})();
