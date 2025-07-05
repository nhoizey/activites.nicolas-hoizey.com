---
layout: accueil
title: Les activités de Nicolas Hoizey
nav:
  order: 1
  title: Accueil
---

Bienvenue sur ce site, qui présente les activités sportives de Nicolas Hoizey.

<div>
{% for entry in collections.activites %}
  <article class="activites">
    <h2 class="activites__title"><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2>
    <p class="activites__meta">{{ entry.date | readableDate }}</p>
  </article>
{% endfor %}
</div>
