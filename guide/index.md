---
layout: content
priority: high
note: |  
   
layout: content
priority: high
note: |  
  <p>Problem -  You don’t make it easy.</p>
  <p>Best Practice -  A developer guide provides details surrounding various API topics.</p>
  <p>Benchmarks -  <a href="https://developer.spotify.com/web-api/user-guide/" target="_blank">Spotify Web API User Guide</a> and <a href="https://developer.spotify.com/web-api/authorization-guide/" target="_blank">Spotify Web API Authorization Guide</a></p> 
  <p>Note - This is a prototype.  As the API matures, this content will change.</p>
---

# Developer Guide

The {{ site.productname }} API is designed to help you unlock your key {{ site.productname }} data by allowing developers to create applications that manage constituents, addresses, email addresses, attributes, etc.  Since the API is based on REST principles, it's very easy to write and test applications. You can use your browser to access URLs, and you can use pretty much any HTTP client in any programming language to interact with the API.

<p class="alert alert-info">Note that by using Blackbaud developer tools, you accept our Developer Terms of Use. </p>

> TO DO:  Work with BB legal to develop a Developer Terms of Use.
> 
> TO DO:  Provide link to legal for Developer Terms of Use.

## Audience
Currently, the RE NXT API is only available to a limited group of Blackbaud partners.  Over time, as the API matures, we will open the API to a wider audience.  If you are an existing of potential Blackbaud Partner and are interested in building an integration or 3rd party product that integrates with our APIs, we encourage you to contact our Partnership team.  If all goes well, you can apply to one of our API products within the developer portal.  For details, see our <a href="{{ '/tutorials/getting-started/' | prepend: site.baseurl }}" > Getting Started</a> tutorial. 

> TO DO:  Review the above with Partnership Team and Product Management

> TO DO:  Provide email form to contact product management and global partnership team

This documentation is designed for people familiar with HTTP programming and RESTful programming concepts. You should also be familiar with the Raiser's Edge from a user's and administrator's point of view. There are many HTTP RESTful tutorials available on the Web, including using cURL and Fiddler to make and test HTTP requests. If you are unfamiliar with HTTP programming and RESTful Web API’s, we recommend spending some time reviewing [API Fundamentals].

> TO DO: Add API Fundamentals and incorporate link above


## Architectural Style
The {{ site.productname }} API is organized around REST. Our API is designed to have predictable, resource-oriented URLs and to use HTTP response codes to indicate API errors. We use built-in HTTP features, like HTTP authentication and HTTP verbs, which can be understood by off-the-shelf HTTP clients, and we support cross-origin resource sharing to allow you to interact securely with our API from a client-side web application (though you should remember that you should never expose your secret API key in any public website's client-side code). JSON will be returned in all responses from the API, including errors.

> TO DO: We need to determine if we support cross-origin resource sharing (CORS).
>
> TO DO:  Verify the format of the data returned in responses from the API.  JSON only?

## Web API Authorization	

This guide shows you how to enable your application to obtain a user’s authorization to access private {{ site.productname }} data through the {{ site.productname }} API. <a href="https://tools.ietf.org/html/rfc6749" > OAuth 2.0</a> is an authorization framework commonly used to grant client applications limited access to a  user's resources without exposing the users credentials to the client application. Some requests to the {{ site.productname }} API require authorization; that is, the user of a client application must have granted permission for an client application to access the requested {{ site.productname }} data. To prove that the user has granted permission, the request header sent by the client application must include a valid OAuth 2.0 access token.  An access token is a string representing an authorization issued to the client application by Blackbaud. The access token is used in OAuth to provide limited access to protected resources.  The access token is passed to subsequent API calls to do things such as searching or adding a constituent.

<p class="alert alert-info">All communication with Blackbaud servers be over SSL (https://) </p>

### Sign up and get your keys
As the first step towards authorization, you will need to sign up within our developer portal and subscribe to the appropriate API product.    This  will give you your primary and secondary API keys to use in the authorization flow.  You can manage your API keys from your account within the {{ site.devportalname }}. It will also provide access to analytics for your subscription.  See the <a href="{{ '/tutorials/getting-started/' | prepend: site.baseurl }}" > Getting Started</a> tutorial for help on signing up and obtaining your keys.

> To do:  Verify which keys  (primary and/or secondary API key) are used as the public API key and secret API key.

> What does an API key represent?  Does it represent a specific client app's subscription to an API product?  Or, does it represent a client app developer's subscription to an API product?

<p class="alert alert-info">It is important to keep the secret API key secure.  You should never expose the secret API key in your code.  You should take special care to never store the secret API key on the client, such as a native mobile or browser-based apps.</p>

![Ipsum Image][ipsum-image-00]

### Register your app

Before you can begin the OAuth process, you must first register a new app with the service. When registering a new app, you usually register basic information such as application name, website, a logo, etc. In addition, you must register a redirect URI to be used for redirecting users to for web server, browser-based, or mobile apps.  See the <a href="{{ '/tutorials/registerapp/' | prepend: site.baseurl }}" > Register Your App</a> tutorial for help on registering your application.

### Supported Authorization Flows
The {{ site.productname }} API currently only supports the Authorization Code flow:

#### Authorization Code Flow
The Authorization Code flow first gets a code then exchanges it for an access token and a refresh token.  An advantage of this flow is that you can use refresh tokens to extend the validity of the access token. This method is suitable for long-running applications which the user logs into once. Since the token exchange involves sending your secret API key, this should happen on a secure location, like a back-end service or back-end web app, not from a client like a browser-based or mobile app.   The Authorization Code flow is described in [RFC-6749](http://tools.ietf.org/html/rfc6749#section-4.1). This flow is the authorization flow used in our <a href="{{ '/tutorials/auth/' | prepend: site.baseurl }}" >Web API Authorization Tutorial</a>.

<p class="alert alert-info">As a best practice, Blackbaud recommends you use Authorization Code Flow within a Web application or service that is written in a server-side language and run on a server where the source code of the application is not available to the public. With the Authorization Code flow the token exchange involves sending your secret API key. This should happen on a secure location, like a backend service, not from code running on a client like a browser or a mobile app.
</p>

> To do:  If new use cases require the addition of different OAuth grant types, such as Implict flow for browser-based or mobile apps, we will need to document these new grant types within this section. 

## Requests

The {{ site.productname }} API is based on REST principles: data resources are accessed via standard HTTPS requests in UTF-8 format to an API endpoint. Where possible, the API strives to use appropriate HTTP verbs for each action:

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th >Verb</th>
			<th >Description</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>GET</td>
		<td>Used for retrieving resources.</td>
	</tr>
	<tr>
		<td>POST</td>
		<td>Used for creating resources.</td>
	</tr>
	<tr>
		<td>PUT</td>
		<td>Used for changing/replacing resources or collections.</td>
	</tr>
	<tr>
		<td>DELETE</td>
		<td class="column-2">Used for deleting resources.</td>
	</tr>
	</tbody>
  </table>
</div>

### Base URL

Through the RE NXT Web API your applications can retrieve and manage Raiser's Edge content.  The endpoints for the API reside off the base url `https://api.blackbaud.com/{version}`.  The majority of endpoints access *private* data, such as constituent data.  To access private data an application must get permission from a specific customer's user.   <a href="{{ '/tutorials/auth/' | prepend: site.baseurl }}" > Authorization</a> is done via the {{site.authservicename}} at `https://auth.blackbaud.com`.  

> TO DO: Verify the base url and SSL (HTTPS) with API engineering team.

> TO DO: Does the URL contain identifying information that organizes resources for a specific instance/customer/tenant?  Is another mechanism used to identify a specific instance/customer/tenant?

> TO DO:  Provide a sample of a typical url and indicate the base url and other pieces such as https, resource, tenant, etc.

### Common Parameters and Identifiers

In requests to the API and responses from it, you will frequently encounter the following parameters within  query string which is added to the base endpoint URI.

####Common Authorization Request Parameters
In the Authorization request the client constructs the request URI by adding the following parameters to the query component of the authorization endpoint URI using the the "application/x-www-form-urlencoded" format. 

> TO DO:  Document the max length of the client identifier (client_id) parameter issued by the Blackbaud authorization server. 

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th >Parameter </th>
			<th >Description</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>client_id</td>
		<td >A unique string representing the registration information provided by the client application (client).  The client_id is issued by the Blackbaud authorization server.   The client identifier is a string with a maximum length of x.  See <a href="https://tools.ietf.org/html/rfc6749#section-4.1.1"> rfc6749 section 4.1.1</a> for more info.</td>
	</tr>
	<tr>
		<td>response_type</td>
		<td>The value must be set to "code".</td>
	</tr>
	<tr>
		<td>redirect_uri</td>
		<td>After obtaining a user’s authorization to access private {{ site.productname }} data, the authorization server will redirect your client application (user-agent) to the your redirection endpoint previously established with the authorization server during the client registration process. See <a href="https://tools.ietf.org/html/rfc6749#section-4.1.1"> rfc6749 section 4.1.1</a> and <a href="{{ '/guide/#web-api-authorization' | prepend: site.baseurl }}" >Web API Authorization</a> for more info.</td>
	</tr>
	<tr>
		<td>state</td>
		<td class="column-2">A value used by the client application to maintain state between the request and callback.  The Blackbaud authorization server includes the value when redirecting the user back to the client application.  See <a href="https://tools.ietf.org/html/rfc6749#section-4.2.1"> rfc6749 section 4.2.1</a> for more info.</td>
	</tr>
	</tbody>
  </table>
</div>

####Common Endpoint Request Parameters
In the request to end points such as the Constituent or Address resources, the client constructs the request URI by adding the following parameters to the query component of the endpoint URI.

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th >Parameter </th>
			<th >Description</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>client_id</td>
		<td >A unique string representing the registration information provided by the client application (client).  The client_id is issued by the Blackbaud authorization server.   The client identifier is a string with a maximum length of x.  See <a href="https://tools.ietf.org/html/rfc6749#section-4.1.1"> rfc6749 section 4.1.1</a> for more info.</td>
	</tr>
	
	</tbody>
  </table>
</div>

### Common Request Headers
Because {{ site.productname }} API uses HTTP for all communication, you need to ensure that the correct HTTP headers are supplied (and processed on retrieval) so that you get the right format and encoding. Different environments and clients will be more or less strict on the effect of these HTTP headers (especially when not present). Where possible you should be as specific as possible.

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th >Header </th>
			<th >Description</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>Content-type</td>
		<td >A unique string representing the registration information provided by the client application (client).  Thie client_id is issued by the Blackbaud authorization server.   See <a href="https://tools.ietf.org/html/rfc6749#section-4.2.1"> rfc6749 section 4.2.1</a> for more info.</td>
	</tr>
	
	</tbody>
  </table>
</div>

##Responses
All data is received as a JSON object.

>  To Do:  Document the standard/typical HTTP request response headers returned by the API such as Content-type and Content-length *Engineering should work with documentation to identify and explain any significant and important HTTP headers such as Cache-control or Authorization*



## Version

When we change the API in a backwards-incompatible way, we release a new  version.

> Below represents some test verbiage for versioning and does not necessarily reflect the final versioning strategy

> TO DO: Get the correct versioning story from API Team engineers

For the RE NXT API, the URL has a major version number (v1), but the API has date based sub-versions which can be chosen using a custom HTTP request header. In this case, the major version provides structural stability of the API as a whole while the dated versions account for smaller changes (field deprecation, endpoint changes, etc). 

### What changes does Blackbaud consider to be “backwards-compatible”? ##

- Adding new API resources.
- Adding new optional request parameters to existing API methods.
- Adding new properties to existing API responses.
- Changing the order of properties in existing API responses.
- Changing the length or format of object IDs or other opaque strings. This includes adding or removing fixed prefixes. 
- You can safely assume IDs we generate will never exceed x characters, but you should be able to handle IDs of up to that length. If for example you’re using MySQL, you should store IDs in a VARCHAR(x) COLLATE utf8_bin column (the COLLATE configuration ensures case-sensitivity in lookups).

> TO DO: Get input to backwards-compatible changes from API Team engineers

### API Changelog
The  <a href="{{ '/resources/changelog/' | prepend: site.baseurl }}" >Change Log</a> reflects backwards-incompatible updates, backward compatible updates, removed features due to planned deprecation, features marked for future planned deprecation, and fixes for bugs or known issues. Make sure you’re subscribed to our blog and API mailing list to keep up with API changes.

> TO DO: API Team engineers will be a major contributor the changelog as we version the API.  Potentially use TFS to categorize and track backwards-incompatible updates, backward compatible updates, removed features due to planned deprecation, features marked for future planned deprecation, and fixes for bugs or known issues.  


##Rate limiting
> TO DO:  This section is simply a prototype.  The API team may not wish to employ Rate Limiting at this time. 

To make the API fast for everybody, rate limits apply. Unauthenticated requests are processed at the lowest rate limit. Authenticated requests with a valid access token benefit from higher rate limits — this is true even if endpoint doesn’t require an access token to be passed in the call. Read Web API Authorization for more information about how to register an application and sign your requests with an access token.

A way to reduce the amount of requests is to use endpoints that fetch multiple entities. If you are making many requests to get single constituents, events or Gifts, you can use endpoints such as Get Constituents, Get Events or Get Gifts instead.

> Any new endpoints that retrieve multiple resources would have to be prioritized in the backlog.

##Timestamps
> TO DO:  This section is simply a prototype.  Verify format of all dates and times with the API team.

Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with zero offset: YYYY-MM-DDTHH:MM:SSZ. 

##Pagination

> TO DO:  This section is simply a prototype. Pagination may be added at a later time.  Verify with API Team

Some endpoints support a way of paging the dataset, taking an offset and limit as query parameters:

    $ curl "https://api.blackbaud.com/v1/constituents?offset=20&limit=10"

Note that offset numbering is zero-based and that omitting the offset parameter will return the first X elements. Check the technical reference for the specific endpoint to see the default limit value. Requests that return an array of items are automatically paginated if the number of items vary (for example, addresses for a constituent). 

##Response Status Codes
The API uses the following response status codes, as defined in the RFC 2616 and RFC 6585:


## HTTP Fundamentals
ipsum lorem

[sign up]: https://bbbobbyearl.portal.azure-api.net/
[signing up]: https://bbbobbyearl.portal.azure-api.net/
[getting started]: http://blackbaud-community.github.io/developer.blackbaud.com-renxt/start/
[support]: http://blackbaud-community.github.io/developer.blackbaud.com-renxt/support/

[endpoints]: https://bbbobbyearl.portal.azure-api.net/docs/services/5489b7687376d0092c2d38a1/operations/5489b76a7376d00b90cb1a02

[ipsum-image-00]: http://placehold.it/800x300

[fc6749-section-22]: https://tools.ietf.org/html/rfc6749#section-2.2