---
layout: accueil
title: Les activités de Nicolas Hoizey
nav:
  order: 1
  title: Accueil
  icon: home
---

Bienvenue sur ce site, qui présente les activités sportives de Nicolas Hoizey.

<section class="activites">
  <h2>Activités récentes</h2>
  {% for entry in collections.activites %}
  <article class="card">
    <h3><a href="{{ entry.url }}">{{ entry.data.title }}</a></h3>
    <p class="meta">{{ entry.date | readableDate }}</p>
  </article>
  {% endfor %}
</section>

<section class="blog">
  <h2>Dans le blog</h2>
  {% for entry in collections.blog %}
  <article class="card">
    <h3><a href="{{ entry.url }}">{{ entry.data.title }}</a></h3>
    <p class="meta">{{ entry.date | readableDate }}</p>
  </article>
  {% endfor %}
</section>
