# Les activités de Nicolas Hoizey

Ce code permet de générer le site [activites.nicolas-hoizey.com](https://activites.nicolas-hoizey.com).

## Présentation

Il s'agit d'un site statique construit avec [Eleventy](https://www.11ty.dev/), utilisant des pages rédigées en Markdown et des données d'activité au format GPX, issues par exemple de Strava ou Komoot.

Plus d'infos dans [le colophon](https://activites.nicolas-hoizey.com/colophon/).

## Configuration

|Pour que le site fonctionne correctement, certaines variables d'environnement doivent ou peuvent être définies, soit dans un fichier `.env` à la racine du projet, soit dans l'environnement où se fait le build (CI/CD).

| **Variable**           | **Description**                                                                                                                                                                                                                                                                                                           | **Par défaut** | **Obligatoire** |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|-----------------|
| `MAPBOX_ACCESS_TOKEN`  | Token pour l'API Mapbox ([à créer ici](https://console.mapbox.com/account/access-tokens/)), nécessaire pour afficher les cartes.                                                                                                                                                                                          | Aucune         | Oui             |
| `TZ`                   | Le fuseau horaire à utiliser pour les dates et heures.                                                                                                                                                                                                                                                                    | `Europe/Paris` | Non             |
| `LANGUAGE`             | La langue à utiliser pour le site.                                                                                                                                                                                                                                                                                        | `fr-FR`        | Non             |
| `CLOUDINARY_CLOUDNAME` | Identifiant « Cloud Name » du compte Cloudinary utilisable pour l'optimisation des images. Si cet identifiant n'est pas disponible, les images sont optimisées par le plugin [Eleventy Image](https://www.11ty.dev/docs/plugins/image/), ce qui prend plus de temps, génère plus de HTML et est légèrement moins optimal. | Aucune         | Non             |

## Publication de contenus

### Activités

#### Informations générales

Les activités sont définies dans des fichiers Markdown situés dans `src/collections/activites/YYYY/MM/DD/slug/index.md`, où `YYYY`, `MM` et `DD` correspondent à l'année, au mois et au jour de l'activité, et `slug` est un identifiant unique pour l'activité.

Un script `./_scripts/activity.js` permet d'ajouter une nouvelle activité en créant le répertoire et le fichier Markdown correspondant, avec les en-têtes `YAML Front Matter` de base.

Il se lance avec la commande `./_scripts/activity.js "Titre de l'activité" YYYY-MM-DD`. Si la date n'est pas fournie, la date du jour est utilisée.

Un bookmarklet peut être ajouté au navigateur sur la page `/strava2md.html`. En étant sur la page d'une activité Strava, il va récupérer un maximum d'informations et générer dans le presse-papier le contenu du fichier Markdown, qu'il suffit de coller à la place de celui par défaut.

#### Données d'activité

Le fichier de trace GPX doit être placé dans le sous dossier `sources`, avec le nom `original.gpx`.

Il est possible de fournir également un fichier `original.fit` pour de futurs usages, mais il n'est pas encore exploité.

#### Photos

Les photos doivent être placées dans le sous dossier `photos`, au format JPEG (avec extension `.jpg` ou `.jpeg`).

Il est possible d'utiliser ces photos dans le contenu Markdown de l'activité avec la syntaxe standard Markdown :

```markdown
![Texte alternatif décrivant la photo](photos/nom-de-la-photo.jpg)
```
