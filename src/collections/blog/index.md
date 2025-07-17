---
title: Blog
nav:
  order: 3
  icon: blog
---

<div>
{% for entry in collections.blog %}
  <article class="blog">
    <h2 class="blog__title"><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2>
    <p class="blog__meta">{{ entry.date | readableDate }}</p>
  </article>
{% endfor %}
</div>
