---
layout: accueil
title: Les activités de Nicolas Hoizey
nav:
  order: 1
  title: Accueil
---

Bienvenue sur ce site, qui présente les activités sportives de Nicolas Hoizey.

<section class="activites">
  <h2>Dernières activités</h2>
  {% for entry in collections.activites %}
  <article class="activites">
    <h3 class="activites__title"><a href="{{ entry.url }}">{{ entry.data.title }}</a></h3>
    <p class="activites__meta">{{ entry.date | readableDate }}</p>
  </article>
  {% endfor %}
</section>

<section class="blog">
  <h2>Derniers articles du blog</h2>
  {% for entry in collections.blog %}
  <article class="blog">
    <h3 class="blog__title"><a href="{{ entry.url }}">{{ entry.data.title }}</a></h3>
    <p class="blog__meta">{{ entry.date | readableDate }}</p>
  </article>
  {% endfor %}
</section>
