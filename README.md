# Les activités de Nicolas Hoizey

Ce code permet de générer le site [activites.nicolas-hoizey.com](https://activites.nicolas-hoizey.com).

## Présentation

Il s'agit d'un site statique construit avec [Eleventy](https://www.11ty.dev/), utilisant des pages rédigées en Markdown et des données d'activité au format GPX, issues par exemple de Strava ou Komoot.

## Configuration

|Pour que le site fonctionne correctement, certaines variables d'environnement doivent ou peuvent être définies, soit dans un fichier `.env` à la racine du projet, soit dans l'environnement où se fait le build (CI/CD).

| **Nom de la variable** | **Description** | **Obligatoire** |
|------------------------|------------------|-----------------|
| `MAPBOX_ACCESS_TOKEN` | Un token valide pour l'API Mapbox ([à créer ici](https://console.mapbox.com/account/access-tokens/)), nécessaire pour afficher les cartes. | Oui |
| `TZ` | Le fuseau horaire à utiliser pour les dates et heures. Par défaut, il est réglé sur `Europe/Paris`. | Non |
| `LANGUAGE` | La langue à utiliser pour le site. Par défaut, il est réglé sur `en-US`. | Non |
