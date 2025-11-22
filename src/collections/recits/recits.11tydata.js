import fs from "node:fs";
import path from "node:path";

const rawContent = (data) => {
	if (!data.page.inputPath.endsWith("index.md")) {
		return "";
	}
	const filePath = path.join(data.eleventy.env.root, data.page.inputPath);
	return fs.readFileSync(filePath, "utf-8");
};

export default {
	eleventyComputed: {
		rawContent: (data) => rawContent(data),
		atomContent: (data) => {
			let content = rawContent(data);

			// Remove frontmatter
			content = content.replace(/^---[\s\S]+?---/, "").trim();

			// Remove embed macro import and css inclusion
			content = content.replace(
				`{%- css "critical" %}{% renderFile "src/assets/sass/components/embed.scss" %}{% endcss %}
{% from "macros/embed.njk" import embed %}

`,
				"",
			);

			const embeds = [
				...content.matchAll(
					/{{\s*embed\(collections\.activites,\s*\[([^\]]+)\]\)\s*}}/g,
				),
			];

			if (embeds.length > 0) {
				for (const embed of embeds) {
					const activitiesSlugs = embed[1]
						.split(",")
						.map((s) => s.trim().replace(/^['"]|['"]$/g, ""));

					let embedContent = "";
					for (const slug of activitiesSlugs) {
						const activityPath = path.join(
							data.eleventy.env.root,
							"src/collections/activites",
							slug,
							"index.md",
						);
						if (fs.existsSync(activityPath)) {
							const activityFileContent = fs.readFileSync(
								activityPath,
								"utf-8",
							);

							let activityTitle = "";
							let activityTitleMarkdown = "";
							const activityTitleFromFrontmatter =
								activityFileContent.match(/^title:\s*(.+)$/m);
							if (activityTitleFromFrontmatter) {
								activityTitle = activityTitleFromFrontmatter[1];
								activityTitleMarkdown = `
## [${activityTitle}](/activites/${slug})

`;
							}

							let activityContent = fs.readFileSync(activityPath, "utf-8");
							// Remove frontmatter
							activityContent = activityContent
								.replace(/^---[\s\S]+?---/, "")
								.trim();

							// Fix photo relative URLs
							activityContent = activityContent.replace(
								/!\[([^\]]*)\]\(photos\/([^)]+)\)/g,
								`![$1](/activites/${slug}photos/$2){width=600}`,
							);

							// Add map if exists
							let activityMapMarkdown = "";
							const activityMapPath = path.join(
								data.eleventy.env.root,
								"src/_cache/maps/collections/activites",
								slug,
								"map.jpeg",
							);
							if (fs.existsSync(activityMapPath)) {
								const activityMapUrl = `/activites/${slug}map.jpeg`;
								activityMapMarkdown = `![Carte de l'activité${activityTitle !== "" ? ` « ${activityTitle} »` : ""}](${activityMapUrl}){width=400}

`;
							}

							embedContent += `${activityTitleMarkdown}${activityMapMarkdown}${activityContent}
`;
						} else {
							console.warn(`Activity not found: ${activityPath}`);
						}
					}
					content = content.replace(embed[0], embedContent.trim());
				}
			}

			// Fix photo absolute URLs
			content = content.replace(
				/!\[([^\]]*)\]\(\/collections\/activites\/([^)]+)\)/g,
				"![$1](/activites/$2){width=600}",
			);

			return content;
		},
	},
};
