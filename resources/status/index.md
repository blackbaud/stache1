---
---

# System Status

<div class="alert alert-warning">Please note this page is a mockup.  The API Management suite or another third party would most likely provide this information.</div>

<table class="table table-bordered">
  <tr>
    <th></th>
    {% for i in (0...6) %}
      <th class="text-center">{{ 'now' | date: '%b' }} {{ 'now' | date: '%-d' | minus: i }}</th>
    {% endfor %}
  </tr>
  <tr>
    <th>Authorization</th>
    {% for i in (0...6) %}
      {% include status.html api="authorization" %}
    {% endfor %}
  </tr>
  <tr>
    <th>Constituent</th>
    {% for i in (0...6) %}
      {% include status.html api="constituent" %}
    {% endfor %}
  </tr>
  <tr>
    <th>RENXT</th>
    {% for i in (0...6) %}
      {% include status.html api="renxt" %}
    {% endfor %}
  </tr>
</table>