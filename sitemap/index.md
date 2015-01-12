---
---

### Bootstrap Inspiration

I can never remember the link for <a href="{{ 'Trip/startbootstrap-stylish/' | prepend: site.baseurl }}">Trip's Bootstrap Prototype</a>.

### Sitemap Generated ###

The following sitemap is automatically generated based on the structure defined in _config.yml.

<ul>
{% for item in site.links %}
  <li>
    <a href="{{ item.url | prepend: site.baseurl }}">{{ item.name }}</a>
    {% if item.links %}
      <ul>
        {% for item in item.links %}
          <li>
            <a href="{{ item.url | prepend: site.baseurl }}">{{ item.name }}</a>
          </li>
        {% endfor %}
      </ul>
    {% endif %}
  </li>
{% endfor %}
</ul>