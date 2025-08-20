---
title: Colophon
---

Ce site est statique, généré avec {% inline_icon 'eleventy' %}&nbsp;[{{ eleventy.generator }}](https://www.11ty.dev/). De multiples automatismes sont apportés par le plugin [Pack11ty](https://pack11ty.dev/).

Les contenus sont rédigés en Markdown et les gabarits de pages sont écrits en Nunjucks.

Le site est hébergé chez {% inline_icon 'alwaysdata' %}&nbsp;[alwaysdata](https://www.alwaysdata.com/fr/).

Les icônes d'interface proviennent de {% inline_icon 'lucide' %}&nbsp;[Lucide](https://lucide.dev/).

Les icônes d'activités sont soit issues directement de [SVG Repo](https://www.svgrepo.com/), soit créées spécialement pour ce site, éventuellement à base de modification d'icônes de SVG Repo (avec [SvgPathEditor](https://yqnn.github.io/svg-path-editor/)). Par exemple, les icônes pour le [gravel](/activites/gravel/) ({% inline_icon 'gravel' %}) et le [VTT](/activites/vtt/) ({% inline_icon 'vtt' %}) sont dérivées de [cette icône "bicycle"](https://www.svgrepo.com/svg/509755/bicycle) ({% inline_icon 'velo' %}). Les icônes sont optimisées avec [SVGOMG](https://jakearchibald.github.io/svgomg/).

Les cartes sont générées avec {% inline_icon 'mapbox' %}&nbsp;[Mapbox GL JS](https://www.mapbox.com/mapbox-gljs). Les données des parcours sont publiées au format GPX, qui est automatiquement optimisé avec [GPSBabel](https://www.gpsbabel.org/htmldoc-development/filter_simplify.html) puis transformé en GeoJSON.

Toutes les photos sont prises par moi-même, et sont redimensionnées et optimisées avec {% inline_icon 'cloudinary' %}&nbsp;[Cloudinary](https://cloudinary.com/), grâce à des URLs générées par le plugin [Eleventy Image](https://www.11ty.dev/docs/plugins/image/).

