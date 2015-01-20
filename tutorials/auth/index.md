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
- Retrieve that data from a {{ site.productname }} API endpoint

The authorization flow we will use in this tutorial is the Authorization Code Flow. This flow first gets a code from the {{ site.authorizationservicename }}, then exchanges that code for an access token. The code-to-token exchange requires a secret API key, and for security is done through direct server-to-server communication. 


The data that we will retrieve will be from the Web API’s `/Constituent` endpoint.

The complete source code of the app that we will create in this tutorial is available on GitHub.

## Sign up and get your keys
If you haven't already done so, you will need to sign up within our developer portal and subscribe to the appropriate API product.  This will give you your primary and secondary API keys to use in the authorization flow.  You can manage your API keys from your account within the {{ site.devportalname }}. It will also provide access to analytics for your subscription.  See the <a href="{{ '/tutorials/getting-started/' | prepend: site.baseurl }}" > Getting Started</a> if you help on signing up and obtaining your keys.

<p class="alert alert-info">It is important to keep the secret API key secure.  You should never expose the secret API key in your code.  You should take special care to never store the secret API key on the client, such as a native mobile or browser-based apps.</p>

![Ipsum Image][ipsum-image-00]

## Create an {{ site.productname }} user account  ##

Before you can use the API Console to try out the API, you'll need an API key and a valid OAuth 2.0 access token. The first step to obtain an OAuth 2.0 access token is to create a trial {{ site.productname }} user account.

> To Do:  The developer will need a sandbox database and an RE NXT user account in order to play around with the API. Once the sandbox and trial {{ site.productname }} user account is provisioned for the 3rd party/partner develop, create content here that guides the reader on how to create a trial {{ site.productname }} user account that is associated with a specific tenant. Include necessary images.

![Ipsum Image][ipsum-image-00]

## Step 1 - Register your application

Before you can begin the OAuth process, you must first register a new app with the service. When registering a new app, you usually register basic information such as application name, website, a logo, etc. In addition, you must register a redirect URI to be used for redirecting users to for web server, browser-based, or mobile apps.  See the <a href="{{ '/guide/#registering-your-app' | prepend: site.baseurl }}" > Registering Your App</a> in the developer guide for details on registering your application.

![Ipsum Image][ipsum-image-00]

## Step 2 - Authenticate a user 

ipsum lorem

## Step 3 - Get authorization to access the user’s data
ipsum lorem

## Step 4 - Retrieve that data from a {{ site.productname }} API endpoint 
ipsum lorem


[ipsum-image-00]: http://placehold.it/800x300
[ipsum-image-01]: http://placehold.it/800x800
[ipsum-image-02]: http://placehold.it/800x200
[ipsum-image-03]: http://placehold.it/800x200

[ipsum-image-00A]: holder.js/800x300
[ipsum-image-01A]: holder.js/800x800
[ipsum-image-02A]: holder.js/800x200
[ipsum-image-03A]: holder.js/800x200/sky


