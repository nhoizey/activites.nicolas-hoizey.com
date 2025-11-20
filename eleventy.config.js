// biome-ignore lint/correctness/noUnusedImports: dotenv

import eleventyImage, {
	eleventyImageTransformPlugin,
} from "@11ty/eleventy-img";
import eleventyDirOutputPlugin from "@11ty/eleventy-plugin-directory-output";
import {} from "dotenv/config";
import eleventyPluginPack11ty from "eleventy-plugin-pack11ty";

import { colorsByType, colorsOnDark } from "./src/_data/colors.js";

eleventyImage.concurrency = 1;

const isProd = process.env.ELEVENTY_RUN_MODE === "build";

export default async function (eleventyConfig) {
	// ------------------------------------------------------------------------
	// Pack11ty plugin
	// ------------------------------------------------------------------------

	const pack11tyConfig = {
		responsiver: false,
		minifyHtml: isProd,
		markdown: {
			firstLevel: 2,
			containers: ["info", "success", "warning", "error"],
		},
		passthroughCopyGlob: "**/*.{jpg,jpeg,png,gif,webp,avif,svg,geojson,gpx}",
	};

	eleventyConfig.addPlugin(eleventyPluginPack11ty, pack11tyConfig);

	// ------------------------------------------------------------------------
	// Image transformation plugin
	// ------------------------------------------------------------------------

	const imageOptions = {
		formats: ["jpeg"],
		widths: [640, 800],
		htmlOptions: {
			imgAttributes: {
				loading: "lazy",
				decoding: "async",
			},
			pictureAttributes: {},
		},
		fixOrientation: true,
	};

	if (isProd && process.env.CLOUDINARY_CLOUDNAME !== undefined) {
		imageOptions.urlFormat = ({ hash, src, width, format }) => {
			return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUDNAME}/image/fetch/q_auto,f_auto/c_limit,w_${width}/https://activites.nicolas-hoizey.com/${src.replace(/^src\//, "").replace(/^collections\//, "")}`;
		};
	}

	eleventyConfig.addPlugin(eleventyImageTransformPlugin, imageOptions);

	// ------------------------------------------------------------------------
	// General configuration
	// ------------------------------------------------------------------------

	eleventyConfig.addPassthroughCopy(
		{ "src/_cache/traces/collections/activites/": "activites/" },
		{
			filter: ["**/*.geojson"],
		},
	);
	eleventyConfig.addPassthroughCopy(
		{ "src/_cache/maps/collections/activites/": "activites/" },
		{
			filter: ["**/map.jpeg"],
		},
	);

	eleventyConfig.setDataDeepMerge(true);
	eleventyConfig.setQuietMode(true);

	// https://www.11ty.dev/docs/plugins/directory-output/
	// eleventyConfig.addPlugin(eleventyDirOutputPlugin);

	eleventyConfig.setWatchJavaScriptDependencies(false);

	eleventyConfig.addNunjucksGlobal("colorsOnDark", colorsOnDark);
	eleventyConfig.addNunjucksGlobal("colorsByType", colorsByType);

	return {
		templateFormats: ["md", "njk"],

		markdownTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
		dataTemplateEngine: "njk",
		dir: {
			output: "_site",
			input: "src",
			includes: "_includes",
			layouts: "_layouts",
			data: "_data",
		},
	};
}
