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

