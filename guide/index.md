---
layout: content
priority: high
note: |  
  <p>Problem -  You don’t make it easy.</p>
  <p>Best Practice -  A developer guide provides details surrounding various API topics.</p>
  <p>Benchmarks -  <a href="https://developer.spotify.com/web-api/user-guide/" target="_blank">Spotify Web API User Guide</a> and <a href="https://developer.spotify.com/web-api/authorization-guide/" target="_blank">Spotify Web API Authorization Guide</a></p> 
  <p>Note - This is a prototype.  As the API matures, this content will change.</p>
---

# Developer Guide
{% include note.html priority='medium' note='TO DO:  Work with BB legal to develop a Developer Terms of Use.' %}

The {{ site.productname }} Web API is designed to help you unlock your key {{ site.productname }} data by allowing developers to create applications that manage constituents, addresses, email addresses, attributes, etc.  Since the {{ site.productname }} Web API is organized around REST, it's very easy to write and test applications. You can use your browser and pretty much any HTTP client in any programming language to interact with the Web API.  Our Web API is designed to have predictable, resource-oriented URLs and to use HTTP response codes to indicate API errors. We use built-in HTTP features, like HTTP authentication and HTTP verbs, which can be understood by off-the-shelf HTTP clients, and we support cross-origin resource sharing to allow you to interact securely with our API from a client-side web application (though you should remember that you should never expose your secret API key in any public website's client-side code). JSON will be returned in all responses from the API, including errors.

<p class="alert alert-info">Note that by using Blackbaud developer tools, you accept our <a href="{{ '/legal/' | prepend: site.baseurl }}" class="alert-link">Developer Terms of Use</a>. </p>

## Audience
{% include note.html priority='medium' note='TO DO:  Review with Partnership Team and Product Management<p>TO DO:  Provide email form to contact product management and global partnership team</p>' %}

Currently, the RE NXT API is only available to a select group of Blackbaud partners.  Over time, as the API matures, we will open the API to a wider audience.  If you are an existing of potential Blackbaud Partner and are interested in building an integration or 3rd party product that integrates with our APIs, we encourage you to contact our Partnership team.  If all goes well, you can apply to one of our API products within the developer portal.  For details, see our <a href="{{ '/tutorials/getting-started/' | prepend: site.baseurl }}" > Getting Started</a> tutorial. 

This documentation is designed for people familiar with HTTP programming and RESTful programming concepts. You should also be familiar with the Raiser's Edge from a user's and administrator's point of view. There are many HTTP RESTful tutorials available on the Web, including using cURL and Fiddler to make and test HTTP requests. If you are unfamiliar with HTTP programming and RESTful Web APIs, we recommend spending some time reviewing <a href="{{ '/guide/#web-api-fundamentals' | prepend: site.baseurl }}" >Web API Fundamentals</a>.

## Registering Your App
{% include note.html priority='medium' note='Registering a partner application will initially be a manual process. The content within this section is a prototype.  ' %}
If your application seeks access to {{ site.productname }} data (constituents, gifts, etc.) it must be registered. You can register your application, even before you have created it.  

Follow these steps to register an application:

**1. Go to the *My Applications* page at the {{ site.authorizationservicename }} website. ** 

This page allows you manage your applications that integrate with Blackbaud using the new {{ site.productname }} Web API. 

**2. Click <i>Create a new application</i>**

- Enter the name of your application (for example, “My Test Application”.) Note that this name will be shown in the pop-up that asks the user for authorization to access their Blackbaud {{ site.productname }} data.
- Enter an application description.
- Click the **Create** button.  
 
After your application has been successfully created, you will be directed to a page to enter additional application details.

**3. Enter your website address for your app.**  

- Enter the Website URL where your users can find more information about your application (for example, its user guide, terms of use, licensing restrictions, and support information).

**4.  Note the *Client ID* and *Client Secret* values.** 

- Write these down and keep them safe!

<p class="alert alert-warning">Important: Always store keys securely! <b>Regenerate</b> your client secret if you suspect it has been compromised!</p>

**5.  Add any Redirect URIs** 

- Add the Redirect URI that the {{ site.authorizationservicename }} could call when the authentication process completes. (e.g. http://mysite.com/callback/).  For the purposes of this tutorial, add this URI to the Redirect URIs whitelist:   `http://localhost:8888/callback`.  At a later time, you can come back  and edit this URI. 

<p class="alert alert-warning">Important: When you call the {{ site.authorizationservicename }} from your application, you will send a redirect-uri in the call. The redirect-uri is the address that the {{ site.authorizationservicename }} redirects to after authorization succeeds or fails. If you do not white-list that URI here, authorization will fail. Any URI you enter here must exactly match the value you later use in the calls to the {{ site.authorizationservicename }}, including upper/lowercase characters, terminating slashes, and so on.</p>

**6. Click Save to complete the registration of your application.**

**7.  Your application will now be shown, along with any other applications you have registered, in the main list on the <i>My Applications</i> page:**
![Ipsum Image][ipsum-image-02]

## Web API Authorization	
This guide shows you how to enable your application to obtain a user’s authorization to access private {{ site.productname }} data through the {{ site.productname }} Web API. <a href="https://tools.ietf.org/html/rfc6749" > OAuth 2.0</a> is an authorization framework commonly used to grant client applications limited access to a  user's resources without exposing the users credentials to the client application. Nearly all requests to the {{ site.productname }} Web API require authorization; that is, the user of your client application must have granted permission for your client application to access their requested {{ site.productname }} data. To prove that the user has granted permission, the request header sent by the client application must include a valid OAuth 2.0 access token.  An access token is a string representing an authorization issued to the client application by Blackbaud. The access token is passed to subsequent Web API calls to do things such as searching or adding a constituent.

<p class="alert alert-info">All communication with Blackbaud servers should be over SSL (https://) </p>

### Authorization Code Flow
The {{ site.productname }} Web API currently supports the Authorization Code, Client Credentials, and Implicit Grant flows. 

The Authorization Code flow is suitable for long-running applications which the user logs into once. It provides an access token that can be refreshed. This method first gets a code then exchanges it for an access token and a refresh token.  An advantage of this flow is that you can use refresh tokens to extend the validity of the access token. Since the token exchange involves sending your secret API key, this should happen on a secure location, like a back-end service or back-end web app, not from a client like a browser-based or mobile app.   The Authorization Code flow is described in [RFC-6749](http://tools.ietf.org/html/rfc6749#section-4.1). This flow is the authorization flow used in our <a href="{{ '/tutorials/auth/' | prepend: site.baseurl }}" >Web API Authorization Tutorial</a>.

<p class="alert alert-info">As a best practice, Blackbaud recommends you use Authorization Code Flow within a web application or service that is written in a server-side language and run on a server where the source code of the application is not available to the public. With the Authorization Code flow the OAuth 2.0 access token exchange involves sending your secret API key. The access token exchange should happen on a secure location, like a back-end service, not from code running on a client like a browser or a mobile app.
</p>

The authorization code grant type is a redirection-based flow, the application you write against our Web API must be capable of interacting with a web browser and capable of receiving incoming requests (via redirection) from the {{ site.authorizationservicename }}.

**1. Your application requests authorization**

The authorization process starts with your application sending a request to the {{ site.authorizationservicename }}. (The reason your application sends this request can vary: it may be a step in the initialization of your application or in response to some user action, like a button click.) The request is sent to the `/authorize` endpoint of the Accounts service: `GET https://accounts.blackbaud.com/authorize`

The request will include parameters in the query string:
 
<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th>Query Parameter </th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>client_id</td>
		<td >Required.  The client ID provided to you by Blackbaud when you register your application.See <a href="https://tools.ietf.org/html/rfc6749#section-4.1.1"> rfc6749 section 4.1.1</a> for more info.</td>
	</tr>
	<tr>
		<td>state</td>
		<td class="column-2">A value used by the client application to maintain state between the request and callback.  The {{ site.authorizationservicename }} includes the value when redirecting the user back to the client application.  See <a href="https://tools.ietf.org/html/rfc6749#section-4.2.1"> rfc6749 section 4.2.1</a> for more info.</td>
	</tr>
	<tr>
		<td>response_type</td>
		<td>Required.  The value must be set to "code".</td>
	</tr>
	<tr>
		<td>redirect_uri</td>
		<td>Required.  The URI to redirect to after the user grants/denies permission. This URI needs to have been entered in the Redirect URI whitelist that you specified when you registered your application. The value of redirect_uri here must exactly match one of the values you entered when you registered your application, including upper/lowercase, terminating slashes, etc. See <a href="https://tools.ietf.org/html/rfc6749#section-4.1.1"> rfc6749 section 4.1.1</a>.</td>
	</tr>
	<tr>
		<td>scope</td>
		<td>Optional. A space-separated list of scopes: see <a href="{{ '/guide/#using-scopes' | prepend: site.baseurl }}" >Using Scopes</a>. If no scopes are specified, authorization will be granted to TBD.</td>
	</tr>
	</tbody>
  </table>
</div>

A typical request looks like this:

    GET https://accounts.blackbaud.com/authorize/?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&scope=constituent-read&state=34fFs29kd09

**2.  The user is asked to authorize access within the scopes.**

The {{ site.authorizationservicename }} presents details of the scopes for which access is being sought. If the user is not logged in, they are prompted to do so using their Blackbaud credentials.

When the user is logged in, they are asked to authorize access to the data sets defined in the scopes.

**3.  The user is redirected back to your specified URI**

After the user accepts (or denies) your request, the {{ site.authorizationservicename }} redirects back to the redirect_uri. For our example, this would be the address: <code>https://example.com/callback</code>

If the user has accepted your request, the response query string contains the following parameters:

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th>Query Parameter </th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>code</td>
		<td>An authorization code that can be exchanged for an access token.</td>
	</tr>
	<tr>
		<td>state</td>
		<td class="column-2">The value of the <code>state</code> parameter supplied in the request. </td>
	</tr>
	</tbody>
  </table>
</div>

For example:

    https://example.com/callback?code=NApCCg..BkWtQ&state=profile%2Factivity

If the user has not accepted your request or an error has occurred, the response query string contains the following parameters:

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th>Query Parameter </th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>error</td>
		<td>The reason authorization failed, for example: “access_denied” </td>
	</tr>
	<tr>
		<td>state</td>
		<td class="column-2">The value of the <code>state</code> parameter supplied in the request. </td>
	</tr>
	</tbody>
  </table>
</div>

For example:

    https://example.com/callback?error=access_denied&state=STATE

**4. Your application requests refresh and access tokens**

When the authorization code has been received, you will need to exchange it with an access token by making a POST request to the {{ site.authorizationservicename }}, this time to its /token endpoint:

    POST https://accounts.blackbaud.com/token

The *body* of this POST request must contain the following parameters:

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th>Request body parameter</th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>grant_type</td>
		<td>Required. As defined in the OAuth 2.0 specification, this field must contain the value "authorization_code". </td>
	</tr>
	<tr>
		<td>code </td>
		<td class="column-2">Required. The authorization code returned from the initial request to the Account's <code>/authorize</code> endpoint. </td>
	</tr>
	<tr>
		<td>redirect_uri</td>
		<td class="column-2">Required. This parameter is used for validation only (there is no actual redirection). The value of this parameter must exactly match the value of redirect_uri supplied when requesting the authorization code.</td>
	</tr>
	</tbody>
  </table>
</div>

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th>Header parameter</th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>Authorization </td>
		<td>Required. Base 64 encoded string that contains the client ID and client secret key. The field must have the format: <code>Authorization: Basic &lt;base64 encoded client_id:client_secret&gt;</code>
	</td>
	</tr>
	</tbody>
  </table>
</div>

An alternative way of sending the client id and secret is as request parameters `client_id` and `client_secret` in the POST body, instead of sending them base64-encoded in the header.

**5. The tokens are returned to your application**

On success, the response from the {{ site.authorizationservicename }} has the status code 200 OK in the response header, and the following JSON data in the response body:


<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th>Key</th>
			<th>Value type</th>
			<th>Value description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>access_token</td>
			<td>string</td>
			<td>An access token that can be provided in subsequent calls, for example to {{ site.productname }} Web API services. </td>
		</tr>
		<tr>
			<td>token_type </td>
			<td>string</td>
			<td>How the access token may be used: always "Bearer".</td>
		</tr>
		<tr>
			<td>expires_in </td>
			<td>int</td>
			<td>The time period (in seconds) for which the access token is valid. </td>
		</tr>
		<tr>
			<td>refresh_token</td>
			<td>string</td>
			<td>A token that can be sent to the {{ site.authorizationservicename }} in place of an authorization code. (When the access code expires, send a POST request to the Accounts service <code>/token</code> endpoint, but use this code in place of an authorization code. A new access token will be returned. A new refresh token might be returned too.) </td>
		</tr>
	</tbody>
  </table>
</div>

An example [cURL](http://en.wikipedia.org/wiki/CURL) request and response from the token endpoint will look something like this:

    curl -H "Authorization: Basic ZjM...zE=" -d grant_type=authorization_code -d code=MQCbtKe...44KN -d redirect_uri=https%3A%2F%2Fwww.foo.com%2Fauth https://accounts.blackbaud.com/token
    {
       "access_token": "NgCXRK...MzYjw",
       "token_type": "Bearer",
       "expires_in": 3600,
       "refresh_token": "NgAagA...Um_SHo"
    }

**6. Use the access token to access the {{ site.productname }} Web API**

The access token allows you to make requests to the {{ site.productname }} Web API on a behalf of a user, for example:
    
    curl -H "Authorization: Bearer NgCXRK...MzYjw" https://api.blackbaud.com/v1/constituent/342jsdsaq2wqw

**7. Requesting access token from refresh token**

Access tokens are deliberately set to expire after a short time, after which new tokens may be granted by supplying the refresh token originally obtained during the authorization code exchange.

The request is sent to the token endpoint of the {{ site.authorizationservicename }}:

    POST https://accounts.blackbaud.com/token

The body of this POST request must contain the following parameters:

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th>Request body parameter</th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>grant_type</td>
			<td>Required. Set it to “refresh_token”.</td>
		</tr>
		<tr>
			<td>refresh_token</td>
			<td>Required. The refresh token returned from the authorization code exchange. </td>
		</tr>
	</tbody>
  </table>
</div>

The header of this POST request must contain the following parameter:

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th>Header parameter</th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>Authorization </td>
		<td>Required. Base 64 encoded string that contains the client ID and client secret key. The field must have the format: <code>Authorization: Basic &lt;base64 encoded client_id:client_secret&gt;</code>
	</td>
	</tr>
	</tbody>
  </table>
</div>

For example:

    curl -H "Authorization: Basic ZjM4Zj...Y0MzE=" -d grant_type=refresh_token -d refresh_token=NgAagA...NUm_SHo https://accounts.blackbaud.com/token
    {
       "access_token": "NgA6ZcYI...ixn8bUQ",
       "token_type": "Bearer",
       "expires_in": 3600
    }

### Client Credentials Flow
{% include note.html priority='medium' note='This needs more work.' %}

The Client Credentials flow is used by the developer to access data that is related to their partner client application. This flow is used the **xyz** end points. 

<p class="alert alert-info">The Client Credentials flow does not include authorization and therefore cannot be used to access or manage a user’s private data. This flow is described in <a href="http://tools.ietf.org/html/rfc6749#section-4.4">RFC-6749</a>.</p>

### Implicit Grant Flow

{% include note.html priority='medium' note='This needs more work.' %}

Implicit grant flow is for clients that are implemented entirely using JavaScript and running in the resource owner’s (partner client application user's) browser. You do not need any server-side code to use it.

## Using Scopes
{% include note.html priority='medium' note='This is a prototype of scopes documentation.  Scopes have not been defined for the Web API.' %}
When your application seeks authorization to access user-related data, you will often need to specify one or more scopes. Here’s how.

Most calls to the {{ site.productname }} Web API require prior authorization by your application’s user. To get that authorization, your application will first need to make a call to the {{ site.authorizationservicename }}’s `/authorize` endpoint, passing along a list of the **scopes** for which access permission is sought.

Scopes let you specify exactly what types of data your application wants to access, and the set of scopes you pass in your call determines what access permissions the user is asked to grant.

Example
The following code makes a request asking for scopes ‘constituent-read’:

    code sample here

On execution, the user is redirected to a page explaining the information that is requested:
	
![Ipsum Image][ipsum-image-04]

### Determining the scopes needed
Check an <a href="{{ 'docs/services/5489b7687376d0092c2d38a1/operations/5489b76a7376d00b90cb1a02' | prepend: site.devportalurl }}" >endpoint</a> within the {{site.devportalname}} to see if it does require prior authorization. Usually, authorization is only required for xyz data. For more about authorization see our <a href="{{ '/guide/#web-api-authorization' | prepend: site.baseurl }}" >Web API Authorization Guide</a>.


List of scopes
Here is a list of the available scopes:


<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th>Scope</th>
			<th>Access permissions sought</th>
			<th>Prompt shown to user</th>
		</tr>
	</thead>
	<tbody>
	<tr>
		<td>-</td>
		<td>If no scope is specified, access is permitted only to publicly available information.  Such as xyz.</td>
		<td>Read your publicly available information</td>
	</tr>
	<tr>
		<td>constituent-read</td>
		<td>Read access to all constituents and sub resources.</td>
		<td>Access your constituents, addresses, emails...</td>
	</tr>
	
	</tbody>
  </table>
</div>


## Requests

The {{ site.productname }} Web API is based on REST principles: data resources are accessed via standard HTTPS requests in UTF-8 format to a Web API endpoint. Where possible, the Web API strives to use appropriate HTTP verbs for each action:

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
		<tr>
			<th>Verb</th>
			<th>Description</th>
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

{% include note.html priority='medium' note='TO DO: Update content for endpoints and authorization urls.<p> TO DO:  Provide a sample of a typical url and indicate the base url and other pieces such as https, resource, tenant, etc. </p>' %}

Through the {{ site.productname }} Web API your applications can retrieve and manage Raiser's Edge content.  The endpoints for the Web API reside off the base url `https://api.blackbaud.com/{version}`.  The majority of endpoints access *private* data, such as constituent data.  To access private data an application must get permission from a specific customer's user.   <a href="{{ '/guide/#web-api-authorization' | prepend: site.baseurl }}" > Web API Authorization</a> is done via the {{site.authorizationservicename}} at `https://accounts.blackbaud.com`.  


##Responses

All data is received as a JSON object.


## Version

{% include note.html priority='medium' note='Below represents some test verbiage for versioning and does not necessarily reflect the final versioning strategy' %}

When we change the Web API in a backwards-incompatible way, we release a new  version.

For the {{ site.productname }} Web API, the URL has a major version number (v1), but the Web API has date based sub-versions which can be chosen using a custom HTTP request header. In this case, the major version provides structural stability of the Web API as a whole while the dated versions account for smaller changes (field deprecation, endpoint changes, etc). 

### What changes does Blackbaud consider to be “backwards-compatible”?
{% include note.html priority='medium' note='TO DO: Get input to backwards-compatible changes from  API Team engineers' %}

- Adding new Web API resources.
- Adding new optional request parameters to existing Web API methods.
- Adding new properties to existing Web API responses.
- Changing the order of properties in existing Web API responses.
- Changing the length or format of object IDs or other opaque strings. This includes adding or removing fixed prefixes. 
- You can safely assume IDs we generate will never exceed x characters, but you should be able to handle IDs of up to that length. 

### API Changelog
{% include note.html priority='medium' note='TO DO: API Team engineers will be a major contributor the changelog as we version the API.  Potentially use TFS to categorize and track changes, fixes, issues, new features, bugs, etc.' %}

The  <a href="{{ '/resources/changelog/' | prepend: site.baseurl }}" >Change Log</a> reflects backwards-incompatible updates, backward compatible updates, removed features due to planned deprecation, features marked for future planned deprecation, and fixes for bugs or known issues. Make sure you’re subscribed to our blog and API mailing list to keep up with API changes.

##Timestamps
{% include note.html priority='medium' note='TO DO:  This section is simply a prototype.  Verify format of all dates and times with the API team.' %}

Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with zero offset: YYYY-MM-DDTHH:MM:SSZ. 

##Pagination
{% include note.html priority='medium' note=' TO DO:  This section is simply a prototype. Pagination may be added at a later time.  Verify with API Team' %}


Some endpoints support a way of paging the dataset, taking an offset and limit as query parameters:

    $ curl "https://api.blackbaud.com/v1/constituents?offset=20&limit=10"

Note that offset numbering is zero-based and that omitting the offset parameter will return the first X elements. Check the technical reference for the specific endpoint to see the default limit value. Requests that return an array of items are automatically paginated if the number of items vary (for example, addresses for a constituent). 

##Response Status Codes
The API uses the following response status codes, as defined in the RFC 2616 and RFC 6585:


## Web API Fundamentals
ipsum lorem

[sign up]: https://bbbobbyearl.portal.azure-api.net/
[signing up]: https://bbbobbyearl.portal.azure-api.net/
[getting started]: http://blackbaud-community.github.io/developer.blackbaud.com-renxt/start/
[support]: http://blackbaud-community.github.io/developer.blackbaud.com-renxt/support/
[endpoints]: https://bbbobbyearl.portal.azure-api.net/docs/services/5489b7687376d0092c2d38a1/operations/5489b76a7376d00b90cb1a02


[fc6749-section-22]: https://tools.ietf.org/html/rfc6749#section-2.2

[ipsum-image-00]: http://placehold.it/800x300
[ipsum-image-01]: http://placehold.it/800x800
[ipsum-image-02]: http://placehold.it/800x200
[ipsum-image-03]: http://placehold.it/800x200
[ipsum-image-04]: http://placehold.it/400x400
[ipsum-image-00A]: holder.js/800x300
[ipsum-image-01A]: holder.js/800x800
[ipsum-image-02A]: holder.js/800x200
[ipsum-image-03A]: holder.js/800x200/sky
