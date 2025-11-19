import fs from "node:fs";
import path from "node:path";

const rawContent = (data) => {
  const filePath = path.join(
    data.eleventy.env.root,
    data.page.inputPath
  );
  return fs.readFileSync(filePath, 'utf-8');
};

export default {
  eleventyComputed: {
    rawContent: (data) => rawContent(data),
    cleanContent: (data) => {
      let content = rawContent(data);

      // Remove frontmatter
      content = content.replace(/^---[\s\S]+?---/, '').trim();

      // Remove embed macro import and css inclusion
      content = content.replace(`{%- css "critical" %}{% renderFile "src/assets/sass/components/embed.scss" %}{% endcss %}
{% from "macros/embed.njk" import embed %}

`, '');

      const embeds = [...content.matchAll(/{{\s*embed\(collections\.activites,\s*\[([^\]]+)\]\)\s*}}/g)];

      if (embeds.length > 0) {
        for (const embed of embeds) {
          const activitiesSlugs = embed[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));

          let embedContent = '';
          for (const slug of activitiesSlugs) {
            const activityPath = path.join(
              data.eleventy.env.root,
              'src/collections/activites',
              slug,
              'index.md'
            );
            if (fs.existsSync(activityPath)) {
              const activityTitle = fs.readFileSync(activityPath, 'utf-8').match(/^title:\s*(.+)$/m);

              let activityContent = fs.readFileSync(activityPath, 'utf-8');
              // Remove frontmatter
              activityContent = activityContent.replace(/^---[\s\S]+?---/, '').trim();

              embedContent += `
${activityTitle ? `## [${activityTitle[1]}](/activites/${slug})
` : ''}
${activityContent}
`;
            } else {
              console.warn(`Activity not found: ${activityPath}`);
            }
          }
          content = content.replace(embed[0], embedContent.trim());
        }
      }

      return content;
    }
  }
};