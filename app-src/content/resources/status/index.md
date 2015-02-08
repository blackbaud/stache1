---
---

# System Status

<p class="alert alert-warning">
  Please note this page is a mockup.  The API Management suite or another third party would most likely provide this information.
</p>

<p class="text-right">Last Updated: {{ 'now' | date: '%c' }}</p>

<div class="table-responsive">
  <table class="table table-bordered table-hover">
    <thead>
      <tr>
        <th></th>
        {% for i in (0...6) %}
          <th class="text-center">{{ 'now' | date: '%b' }} {{ 'now' | date: '%-d' | minus: i }}</th>
        {% endfor %}
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Authorization</td>
        {% for i in (0...6) %}
          {% include status.html api="authorization" %}
        {% endfor %}
      </tr>
      <tr>
        <td>Constituent</td>
        {% for i in (0...6) %}
          {% include status.html api="constituent" %}
        {% endfor %}
      </tr>
      <tr>
        <td>RENXT</td>
        {% for i in (0...6) %}
          {% include status.html api="renxt" %}
        {% endfor %}
      </tr>
    </tbody>
  </table>
</div>

<ul class="list-inline">
  <li><i class="fa fa-check-circle text-success"></i> Normal Operation</li>
  <li><i class="fa fa-info-circle text-info"></i> Informational Message</li>
  <li><i class="fa fa-exclamation-triangle text-warning"></i> Performance Issue</li>
  <li><i class="fa fa-times-circle text-danger"></i> Service Disruption</li>
</ul>