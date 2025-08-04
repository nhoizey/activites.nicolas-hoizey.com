import path from "node:path";

import eleventyPluginPack11ty from "eleventy-plugin-pack11ty";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

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
			containers: ["success", "warning", "error"],
		},
		passthroughCopyGlob: "**/*.{jpg,jpeg,png,gif,webp,avif,svg,geojson,gpx}"
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
			pictureAttributes: {}
		},
	}

	if (isProd) {
		imageOptions.urlFormat = ({
			hash,
			src,
			width,
			format,
		}) => {
			return `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto/w_${width}/https://activites.nicolas-hoizey.com/${src.replace(/^src\//, "")}`;
		};
	}

	eleventyConfig.addPlugin(eleventyImageTransformPlugin, imageOptions);

	// ------------------------------------------------------------------------
	// General configuration
	// ------------------------------------------------------------------------

	eleventyConfig.setDataDeepMerge(true);
	eleventyConfig.setQuietMode(true);

	eleventyConfig.setWatchJavaScriptDependencies(false);

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
