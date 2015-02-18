---
layout: sidebar
days: 7
---

# System Status

<p class="alert alert-warning">
  Please note this page is a mockup.  The API Management suite or another third party would most likely provide this information.
</p>

<p class="text-right">Last Updated: yesterday</p>

<div class="table-responsive">
  <table class="table table-bordered table-hover">
    <thead>
      <tr>
        <th></th>
        {{# loop start=0 end=days }}
          <th class="text-center">{{ @index }}</th>
        {{/ loop }}
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Authorization</td>
        {{# loop start=0 end=days }}
          <td class="text-center">
            <a href="#" data-toggle="tooltip" title="Fatal Error">
              <i class="fa fa-times-circle text-danger"></i>
             </a>
          </td>
        {{/ loop }}
      </tr>
      <tr>
        <td>Constituent</td>
        {{# loop start=0 end=days }}
          <td class="text-center">
            <a href="#" data-toggle="tooltip" title="Warning">
              <i class="fa fa-exclamation-triangle text-warning"></i>
             </a>
          </td>
        {{/ loop }}
      </tr>
      <tr>
        <td>RENXT</td>
        {{# loop start=0 end=days }}
          <td class="text-center">
            <a href="#" data-toggle="tooltip" title="Informational">
              <i class="fa fa-info-circle text-info"></i>
             </a>
          </td>
        {{/ loop }}
      </tr>
      <tr>
        <td>FENXT</td>
        {{# loop start=0 end=days }}
          <td class="text-center">
            <i class="fa fa-check-circle text-success"></i>
          </td>
        {{/ loop }}
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