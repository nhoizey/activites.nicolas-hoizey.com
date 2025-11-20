#!/usr/bin/env node

import { existsSync, mkdir } from "node:fs";
import path from "node:path";
// Load .env variables with dotenv
// biome-ignore lint/correctness/noUnusedImports: dotenv
import {} from "dotenv/config";
import glob from "fast-glob";
import { Cluster } from "puppeteer-cluster";
import puppeteer from "puppeteer-core";

(async () => {
	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_BROWSER,
		maxConcurrency: 3,
		workerCreationDelay: 1000,
		retryLimit: 3,
		retryDelay: 5000,
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
			width: 397,
			height: 1133,
			deviceScaleFactor: 1.5,
		});
		await page.setDefaultNavigationTimeout(50000);

		const folder = path.join("./src/_cache/maps/collections", resourcePath);

		// Create the folder if it does not exist
		if (!existsSync(folder)) {
			await mkdir(folder, { recursive: true }, (err) => {
				if (err) throw err;
			});
		}

		const file = path.join(folder, "map.jpeg");

		if (existsSync(file)) {
			return;
		}

		const activiteUrl = `http://localhost:8080/${resourcePath}/`;

		console.log(`Get map image from ${activiteUrl}`);

		await page.goto(activiteUrl, { waitUntil: "networkidle0", timeout: 0 });

		// Remove interactions
		const controlsTopRight = await page.$(".mapboxgl-ctrl-top-right");
		if (controlsTopRight) {
			await controlsTopRight.evaluate((node) =>
				node.parentElement.removeChild(node),
			);
		}
		const controlsBottomLeft = await page.$(".mapboxgl-ctrl-bottom-left");
		if (controlsBottomLeft) {
			await controlsBottomLeft.evaluate((node) =>
				node.parentElement.removeChild(node),
			);
		}
		const controlsBottomRight = await page.$(".mapboxgl-ctrl-bottom-right");
		if (controlsBottomRight) {
			await controlsBottomRight.evaluate((node) =>
				node.parentElement.removeChild(node),
			);
		}

		// Take a screenshot of the map
		const map = await page.$("#map");
		if (map) {
			await map.screenshot({ path: file, type: "jpeg" });
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

	// Queue processing of all photos and galleries
	for (const resourcePath of activites) {
		// console.log(resourcePath);
		// if (resourcePath.match(/^activites\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/[^/]+/)) {
		cluster.queue(resourcePath);
		// }
	}
	await cluster.idle();
	await cluster.close();
})();
