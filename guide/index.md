---
layout: content
---
# Developer Guide

The RE NXT REST API is designed to help you unlock your key RE NXT data by allowing developers to create applications that manage constituents, addresses, email addresses, attributes....

<p class="alert alert-info">Note that by using Blackbaud developer tools, you accept our Developer Terms of Use. </p>

Through the RE NXT Web API your applications can retrieve and manage Raiser's Edge content.  The endpoints for the API reside off the base url `https://api.blackbaud.com/{version}`.  The majority of endpoints access *private* data, such as constituent data.  To access private data an application must get permission from a specific customer's user.   <a href="{{ '/tutorials/auth/' | prepend: site.baseurl }}" > Authorization</a> is done via the Blackbaud Auth service at `https://auth.blackbaud.com`.  

>  TO DO:  Complete Intro Paragraph.  Reference correct path for data and auth end points. 


<!--
## Base URL

All URLs referenced in the documentation have the following base:

    https://api.blackbaud.com/{version}

> TO DO:  Verify the base url with API engineering team
-->

## Audience
Currently, the RE NXT API is only available to a limited group of Blackbaud partners.  Over time, as the API matures, we will open the API to a wider audience.  If you an existing of potential Blackbaud Partner and are interested in building an integration or 3rd party product that integrates with our APIs, we encourage you to contact our Partnership team.  If all goes well, you can apply to one of our API products within the developer portal.  For details, see our <a href="{{ '/tutorials/getting-started/' | prepend: site.baseurl }}" > Getting Started</a> tutorial. 

> TO DO:  Review the above with Partnership Team and Product Management

> TO DO:  Provide email form to contact product management and global partnership team

This documentation is designed for people familiar with HTTP programming and RESTful programming concepts. You should also be familiar with the Raiser's Edge from a user's and administrator's point of view. There are many HTTP RESTful tutorials available on the Web, including using cURL and Fiddler to make and test HTTP requests. If you are unfamiliar with HTTP programming and RESTful Web API’s, we recommend spending some time reviewing [API Fundamentals].

> TO DO: Add API Fundamentals and incorporate link above

## Web API Authorization	

This guide shows you how to get a user’s authorization to access private data through the {{ site.productname }} API.  Some requests to the {{ site.productname }} require authorization; that is, the user must have granted permission for an application to access the requested data. To prove that the user has granted permission, the request header sent by the application must include a valid access token.

As the first step towards authorization, you will need to sign up within our developer portal and subscribe to the appropriate API product.    This  will give you a primary and secondary API keys to use in the authorization flow.  It will also provide access to analytics for your subscription.  See <a href="{{ '/tutorials/getting-started/' | prepend: site.baseurl }}" > Getting Started</a> for details on signing up and obtaining your keys.

![Ipsum Image][ipsum-image-00]

### Supported Authorization Flows
The {{ site.productname }} API currently supports 1 authorization flow:

The Authorization Code flow first gets a code then exchanges it for an access token and a refresh token. Since the exchange uses your *secret API key*, you should make that request server-side to keep the integrity of the key. An advantage of this flow is that you can use refresh tokens to extend the validity of the access token.

> To do:  Verify whether the primary and/or secondary API key is used as the secret API key.

### Authorization Code Flow
The method is suitable for long-running applications which the user logs into once. It provides an access token that can be refreshed. Since the token exchange involves sending your secret API key, this should happen on a secure location, like a backend service, not from a client like a browser or mobile apps. This flow is described in [RFC-6749](http://tools.ietf.org/html/rfc6749#section-4.1). This flow is also the authorization flow used in our <a href="{{ '/tutorials/auth/' | prepend: site.baseurl }}" >Web API Authorization Tutorial</a>.

<p class="alert alert-info">With the Authorization Code flow the token exchange involves sending your secret API key. This should happen on a secure location, like a backend service, not from a client like a browser or mobile apps.</p>


## Version

When we change the API in a backwards-incompatible way, we release a new  version.

*(Below represents some test verbiage for versioning and does not necessarily reflect the final versioning strategy)*

For the RE NXT API, the URL has a major version number (v1), but the API has date based sub-versions which can be chosen using a custom HTTP request header. In this case, the major version provides structural stability of the API as a whole while the dated versions account for smaller changes (field deprecation, endpoint changes, etc). 

> TO DO: Get the correct versioning story from API Team engineers

### What changes does Blackbaud consider to be “backwards-compatible”? ##

- Adding new API resources.
- Adding new optional request parameters to existing API methods.
- Adding new properties to existing API responses.
- Changing the order of properties in existing API responses.
- Changing the length or format of object IDs or other opaque strings. This includes adding or removing fixed prefixes. 
- You can safely assume IDs we generate will never exceed x characters, but you should be able to handle IDs of up to that length. If for example you’re using MySQL, you should store IDs in a VARCHAR(x) COLLATE utf8_bin column (the COLLATE configuration ensures case-sensitivity in lookups).

> TO DO: Get input to backwards-compatible changes from API Team engineers

### API Changelog
The [changelog] reflects backwards-incompatible updates, backward compatible updates, removed features due to planned deprecation, features marked for future planned deprecation, and fixes for bugs or known issues. Make sure you’re subscribed to our blog and API mailing list to keep up with API changes.

> TO DO: API Team engineers will be a major contributor the changelog as we version the API.  Potentially use TFS to categorize and track backwards-incompatible updates, backward compatible updates, removed features due to planned deprecation, features marked for future planned deprecation, and fixes for bugs or known issues.  

## HTTP Fundamentals
ipsum lorem

[sign up]: https://bbbobbyearl.portal.azure-api.net/
[signing up]: https://bbbobbyearl.portal.azure-api.net/
[getting started]: http://blackbaud-community.github.io/developer.blackbaud.com-renxt/start/
[support]: http://blackbaud-community.github.io/developer.blackbaud.com-renxt/support/
[changelog]: http://blackbaud-community.github.io/developer.blackbaud.com-renxt/changelog/
[endpoints]: https://bbbobbyearl.portal.azure-api.net/docs/services/5489b7687376d0092c2d38a1/operations/5489b76a7376d00b90cb1a02

[ipsum-image-00]: http://placehold.it/800x300