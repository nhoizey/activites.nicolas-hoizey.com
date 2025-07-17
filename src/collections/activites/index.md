---
title: Activités
layout: pages
nav:
  order: 2
  icon: map
---

<div>
{% for entry in collections.activites %}
  <article class="activites">
    <h2 class="activites__title"><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2>
    <p class="activites__meta">{{ entry.date | readableDate }}</p>
  </article>
{% endfor %}
</div>
