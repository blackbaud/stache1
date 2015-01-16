---
layout: content
priority: high
note: |  
  <p>Problem -  You don’t make it easy.</p>
  <p>Best Practice - Provide clear instructions and samples on how to negotiate OAuth.</p>
  <p>Benchmark -  <a href="https://developer.spotify.com/web-api/tutorial/" target="_blank">Web API Tutorial</a></p> 
  <p>Note - This is a prototype.  As the API matures, this content will change.</p> 
---

# Web API Authorization Tutorial #

This tutorial shows you how to create a small server-side application that accesses user-related data through the  {{ site.productname }} API.


<p class="alert alert-info">Note that by using Blackbaud developer tools, you accept our <a href="{{ '/legal/' | prepend: site.baseurl }}" >Developer Terms of Use</a>. </p>

Through the {{ site.productname }} API, external applications can retrieve {{ site.productname }} content such as constituent data and events. If an application wants to access user-related data through the Web API, it must get the user’s authorization to access that data.

This tutorial is based around the creation of a simple application using ASP.NET MVC.   We will show you how to:

- Register an application with Blackbaud
- Authenticate a user
- Get authorization to access the user’s data
- Retrieve that data from a {{ site.productname }} API endpoint.

The authorization flow we will use in this tutorial is the Authorization Code Flow. This flow first gets a code from the {{ site.authservicename }}, then exchanges that code for an access token. The code-to-token exchange requires a secret API key, and for security is done through direct server-to-server communication. 

<p class="alert alert-info">It is important to keep the secret API key secure.  You should never expose the secret API key in your code.  You should take special care to never store the secret API key on the client, such as a native mobile or browser-based apps.</p>

The data that we will retrieve will be from the Web API’s `/Constituent` endpoint.

The complete source code of the app that we will create in this tutorial is available on GitHub.


![Ipsum Image][ipsum-image-00]



[ipsum-image-00]: http://placehold.it/800x300
[ipsum-image-01]: http://placehold.it/800x800
[ipsum-image-02]: http://placehold.it/800x200
[ipsum-image-03]: http://placehold.it/800x200

[ipsum-image-00A]: holder.js/800x300
[ipsum-image-01A]: holder.js/800x800
[ipsum-image-02A]: holder.js/800x200
[ipsum-image-03A]: holder.js/800x200/sky


