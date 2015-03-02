---
layout: sidebar
priority: high
note: |  
  <p>Problem -  You don’t make it easy.</p>
  <p>Best Practice -  A developer guide provides details surrounding various API topics.</p>
  <p>Benchmarks -  <a href="https://developer.spotify.com/web-api/user-guide/" target="_blank">Spotify Web API User Guide</a> and <a href="https://developer.spotify.com/web-api/authorization-guide/" target="_blank">Spotify Web API Authorization Guide</a></p> 
  <p>TO DO:</p>
  <ul>
  <li>Work with BB legal to develop a Developer Terms of Use.</li>
  <li>Audience: Review content with Partnership Team and Product Management</li>
  <li>Registering Your App:  If we want manual instructions, may need a Blackbaud email address for manual registering of client application.  Devs must have a way to receive their <b>client id</b> and <b>secret</b>.  Devs must have way to regenerate secret. </li>
  <li>Registering Your App: Not MVP for CTP. New web app needed to allow for 3rd party dev/partner self service application registration.</li>
  <li>Common Request Headers: Document the standard/typical HTTP request response headers returned by the API such as Content-type and Content-length. Engineering should work with documentation to identify and explain any significant and important HTTP headers such as Cache-control or Authorization</li>
  <li>Versioning:  Versioning strategy and backwards-compatible changes policy are TBD.</li>
  <li>Changelog:  API engineers should track changes, fixes, issues and place into Change log.</li>
  <li>Timestamp:  Verify format of all dates and times with the API team</li>
  <li>Pagination:  Functionality is TBD</li>
  <li>Response Status Codes:  Codes returned by API will be determined by engineering and listed here.   May require automated doc process.</li>
  <li>Get input to backwards-compatible changes from  API Team engineers</li>
  </ul>
---
<p class="alert alert-danger">Draft: This content is a work in progress.  For a list of dependencies and To Do list, click the bottom right info icon.</p>

# Developer Guide

The {{ stache.config.product_name_short }} Web API is designed to help you unlock your key {{ stache.config.product_name_short }} data by allowing developers to create applications that manage constituents data.  Since the {{ stache.config.product_name_short }} Web API is organized around REST, it's very easy to write and test applications. You can use your browser and pretty much any HTTP client in any programming language to interact with the Web API.  Our Web API is designed to have predictable, resource-oriented URLs and to use HTTP response codes to indicate API errors. We use built-in HTTP features, like HTTP authentication and HTTP verbs, which can be understood by off-the-shelf HTTP clients. JSON will be returned in all responses from the API, including errors.

<p class="alert alert-info">Note that by using Blackbaud developer tools, you accept our <a href="{{ stache.config.legal }}" class="alert-link">Developer Terms of Use</a>. </p>

## Audience

Currently, the RE NXT API is only available to a select group of Blackbaud partners.  Over time, as the API matures, we will open the API to a wider audience.  If you are an existing of potential Blackbaud Partner and are interested in building an integration or 3rd party product that integrates with our APIs, we encourage you to constituent our Partnership team.  If all goes well, you can apply to one of our API products within the developer portal.  For details, see our <a href="{{ stache.config.tutorials_getting_started }}" > Getting Started</a> tutorial. 

This documentation is designed for people familiar with HTTP programming and RESTful programming concepts. You should also be familiar with the Raiser's Edge from a user's and administrator's point of view. There are many HTTP RESTful tutorials available on the Web, including using cURL and Fiddler to make and test HTTP requests. 

{{# draft }}
If you are unfamiliar with HTTP programming and RESTful Web APIs, we recommend spending some time reviewing <a href="{{ stache.config.guide_web_api_fundamentals }}" >Web API Fundamentals</a>.
{{/ draft }}

## Registering Your App
If your application seeks access to {{ stache.config.product_name_short }} data (constituents, gifts, etc.) it must be registered. You can register your application, even before you have created it. 

{{# draft }}
Follow these steps to register an application:

**1.  Send an email to {{ stache.config.register_app_email }}**.

- Be sure the email subject reads "{{ stache.config.product_name_short }}-Register My App"
- Within the email body, provide the following information:
	- Application Name:  Your application name. Maximum 60 characters.
	- Application Description:  A short description of your application. Maximum 250 characters.
	- Website URL: Where the user may obtain more information about this application (e.g. http://mystache.config.com).
	- Redirects:  A listing of White-listed addresses to redirect to after authorization success or failure occurs  (e.g. http://mystache.config.com/callback/)
   
**2. Check your email inbox**
You will receive an email that will provide you with your **Client ID** and **Client Secret**.  This information will be needed for Web API Authorization.  

<p class="alert alert-warning">Always store keys securely! Regenerate your client secret if you suspect it has been compromised!</p>

## Registering Your App (Self Service)
**1. Go to <a href="{{ stache.config.portal_applications }}" target="_blank">My Applications</a>** 

This site allows you to manage your applications that integrate with Blackbaud using the new {{ stache.config.product_name_short }} Web API. 

**2. Click <i>Create a new application</i>**

- Enter the name of your application (for example, “My Test Application”.) Note that this name will be shown in the pop-up that asks the user for authorization to access their Blackbaud {{ stache.config.product_name_short }} data.
- Enter an application description.
- Click the **Create** button.  
 
After your application has been successfully created, you will be directed to a page to enter additional application details.

**3. Enter your website address for your app.**  

- Enter the Website URL where your users can find more information about your application (for example, its user guide, terms of use, licensing restrictions, and support information).

**4.  Note the *Client ID* and *Client Secret* values.** 

- Write these down and keep them safe!

<p class="alert alert-warning">Important: Always store keys securely! Regenerate your client secret if you suspect it has been compromised!</p>

**5.  Add any Redirect URIs** 

- Add the Redirect URI that the {{ stache.config.authorization_service_name }} could call when the authentication process completes. (e.g. http://mystache.config.com/callback/).  For the purposes of this tutorial, add this URI to the Redirect URIs whitelist:   `http://localhost:8888/callback`.  At a later time, you can come back  and edit this URI. 

<p class="alert alert-warning">Important: When you call the {{ stache.config.authorization_service_name }} from your application, you will send a redirect-uri in the call. The redirect-uri is the address that the {{ stache.config.authorization_service_name }} redirects to after authorization succeeds or fails. If you do not white-list that URI here, authorization will fail. Any URI you enter here must exactly match the value you later use in the calls to the {{ stache.config.authorization_service_name }}, including upper/lowercase characters, terminating slashes, and so on.</p>

**6. Click Save to complete the registration of your application.**

**7.  Your application will now be shown, along with any other applications you have registered, in the main list on the <i>My Applications</i> page:**

![Ipsum Image][ipsum-image-02]


## Regenerating your client secret (Manual)
If your client secret has be compromised, you will need to follow these steps to regenerate the secret:

**1.  Send an email to {{ stache.config.register_app_email }}**.

- Be sure the email subject reads "{{ stache.config.product_name_short }}-Regenerate my client secret"
- Within the email body, provide the following information:
	- Client ID:  This is the client id value you received from Blackbaud when you registered your application.
	- Application Name:  Your application name. Maximum 60 characters.  The value you provide must match the application name you originally provided when you registered your app.
	- Redirect:  The value you provide must match at least one redirect URL you originally provided when you registered your application.

**2. Check your email inbox**
<p class="alert alert-warning">Blackbaud will send the email to the email address associated with your registered application.  You provided this email address when you registered your application.</p>
 
The email will contain your regenerated **Client Secret**.

## Regenerating your client secret (Self-service)
If your client secret has be compromised, you will need to follow these steps to regenerate the secret:

**1. Go to <a href="{{ stache.config.portal_applications }}" target="_blank">My Applications</a>** 

This site allows you to manage your applications that integrate with Blackbaud using the new {{ stache.config.product_name_short }} Web API. 

**2. Select the app from list of registered applications.**

**3. Underneath Client Secret, select the Regenerate link.**

**4. Securely store the new Client Secret value.**

{{/ draft }}

## Web API Authorization	
This guide shows you how to enable your application to obtain a user’s authorization to access private {{ stache.config.product_name_short }} data through the {{ stache.config.product_name_short }} Web API. <a href="https://tools.ietf.org/html/rfc6749" > OAuth 2.0</a> is an authorization framework commonly used to grant client applications limited access to a  user's resources without exposing the users credentials to the client application. Nearly all requests to the {{ stache.config.product_name_short }} Web API require authorization; that is, the user of your client application must have granted permission for your client application to access their requested {{ stache.config.product_name_short }} data. To prove that the user has granted permission, the request header sent by the client application must include a valid OAuth 2.0 access token.  An access token is a string representing an authorization issued to the client application by Blackbaud. The access token is passed to subsequent Web API calls to do things such as searching a constituent or listing constituent addresses.

<p class="alert alert-info">All communication with Blackbaud servers should be over SSL (https://) </p>

### Supported Authorization Flows
The {{ stache.config.product_name_short }} Web API currently supports three authorization flows:

- The <a href="{{ stache.config.guide_authorization_code_flow }}" >Authorization Code</a> flow first gets a code then exchanges it for an access token and a refresh token. Since the exchange uses your client secret key, you should make that request server-side to keep the integrity of the key. An advantage of this flow is that you can use refresh tokens to extend the validity of the access token.
- The <a href="{{ stache.config.guide_implicit_grant_flow }}" >Implicit Grant</a> flow is carried out client-side and does not involve secret keys. The access tokens that are issued are short-lived and there are no refresh tokens to extend them when they expire.

{{# draft }}
- The <a href="{{ stache.config.guide_client_credentials_flow }}" >Client Credentials</a> flow allows you to get an access token by supplying your client credentials (client ID and secret key).  This flow is used when your application is acting on its own behalf to access protected resources that your application controls.  For example, when your application needs to retrieve a list of customers (tenants) that have approved your application.  This flow is used in server-to-server authentication. Only endpoints that do not access user information can be accessed. 
{{/ draft }}

## Authorization Code Flow

The Authorization Code is suitable for applications than run from a secure location such as a server-side web application or a back-end service.   It is a redirection-based flow that involves first obtaining an authorization code and then exchanging that code for an access token and a refresh token. The authorization code is obtained by using the {{ stache.config.authorization_service_name }} as an intermediary between your application and the {{ stache.config.product_name_short }} user's data. Your application does not directly obtain credentials and request authorization from the {{ stache.config.product_name_short }} user. Instead, your application directs the  {{ stache.config.product_name_short }} user to the {{ stache.config.authorization_service_name }} for authorization.  After authorization occurs, the {{ stache.config.authorization_service_name }} redirects the {{ stache.config.product_name_short }} user back to your application with an authorization code.  Because the {{ stache.config.product_name_short }} user only authenticates with the {{ stache.config.authorization_service_name }}, user's credentials are never shared with your application.  This relieves you from the responsibility of keeping the user's {{ stache.config.product_name_short }} credentials secure.  

<p class="alert alert-info">Since this is a redirection-based flow, the application you write must be capable of interacting with a web browser and capable of receiving incoming requests (via redirection) from the {{ stache.config.authorization_service_name }}.</p>

After receiving an authorization code, your application must exchange the code for an access token and a refresh token.  An advantage of this flow is that you can use refresh tokens to extend the validity of the access token. As long as you have a valid access token for a RE NXT user, that user does not have to keep logging in with {{ stache.config.authorization_service_name }}.  The token exchange involves sending your <b>Client Secret</b> which you obtained when you registered your application. You should send your <b>Client Secret</b> from secure location, like your back-end service or your server-side web app, not from a client like a browser-based or mobile app.   The Authorization Code flow is described in [RFC-6749](http://tools.ietf.org/html/rfc6749#section-4.1). This flow is the authorization flow used in our <a href="{{ stache.config.tutorials_auth }}" >Web API Authorization Tutorial</a>.

<p class="alert alert-warning"> With the Authorization Code flow the OAuth 2.0 access token exchange involves sending your <b>Client Secret</b>. The access token exchange should happen on a secure location.  As a best practice, Blackbaud recommends you use the Authorization Code flow within a web application or back-end service that is written in a server-side language and run on a server where the source code of the application is not available to the public. The access token exchange should not occur from code running on a client like a browser or a mobile app.</p>




**1. Your application requests authorization**

Authorization begins with your application sending a request to the <code>{{ stache.config.authorization_endpoint }}</code> endpoint of the {{ stache.config.authorization_service_name }}.  Exactly when you decide to make this request is up to you.  You may decide to request authorization when your application gathers initial information from the user.  Alternatively, you may decide to authorize when the user first attempts to access a protected resource (user data) managed by the {{ stache.config.product_name_short }} Web API. 

```
GET {{ stache.config.authorization_endpoint }}
```

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
		<td><i>Required</i>.  The <b>Client ID</b> value provided to you by Blackbaud when you <a href="{{ stache.config.guide_registering_your_app }}" >register your application</a>.  See <a href="https://tools.ietf.org/html/rfc6749#section-4.1.1"> rfc6749 section 4.1.1</a> for more info.</td>
	</tr>
	<tr>
		<td>redirect_uri</td>
		<td><i>Required</i>.  The URI to redirect to after the user grants/denies permission. This URI needs to have been entered in the Redirect URI whitelist that you specified when you registered your application. The value of redirect_uri here must exactly match one of the values you entered when you registered your application, including upper/lowercase, terminating slashes, etc. See <a href="https://tools.ietf.org/html/rfc6749#section-4.1.1"> rfc6749 section 4.1.1</a>.</td>
	</tr>
	<tr>
		<td>state</td>
		<td class="column-2"><i>Recommended Best Practice</i>.  An opaque value used by the client application to maintain state between the request and callback.  The {{ stache.config.authorization_service_name }} includes the value when redirecting the user back to the client application.  The <b>state</b> parameter is intended to preserve some state object set by the client in the{{ stache.config.authorization_service_name }} request, and make it available to the client in the response.  The main security reason for this is to stop Cross Site Request Forgery (XRSF) by including something in the request that the client can verify in the response but that an attacker could not know.  An example of this would be a hash of the session cookie or a random value stored in the server linked to the session.  See <a href="https://tools.ietf.org/html/rfc6749#section-4.2.1"> rfc6749 section 4.2.1</a> for more info.</td>
	</tr>
	<tr>
		<td>response_type</td>
		<td><i>Required</i>.  The value must be set to <code>code</code>.</td>
	</tr>
	
	<tr>
		<td>scope</td>
		<td>Optional. A space-separated list of scopes: see <a href="{{ stache.config.guide_using_scopes }}" >Using Scopes</a>. If no scopes are specified, authorization will be granted to TBD.</td>
	</tr>
	</tbody>
  </table>
</div>

A typical request looks like this:

`GET {{ stache.config.authorization_endpoint }}/?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&scope=constituent-read&state=34fFs29kd09`

**2.  The user is asked to authorize access within the scopes.**

The {{ stache.config.authorization_service_name }} presents details of the scopes for which access is being sought. If the user is not logged in, they are prompted to do so using their Blackbaud credentials.

When the user is logged in, they are asked to authorize access to the data sets defined in the scopes.

**3.  The user is redirected back to your specified URI**

After the user accepts (or denies) your request, the {{ stache.config.authorization_service_name }} redirects back to the redirect_uri. For our example, this would be the address: <code>https://example.com/callback</code>

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

```
https://example.com/callback?code=NApCCg..BkWtQ&state=profile%2Factivity
```

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

```
https://example.com/callback?error=access_denied&state=STATE
```

**4. Your application requests refresh and access tokens**

When the authorization code has been received, you will need to exchange it with an access token by making a POST request to the {{ stache.config.authorization_service_name }}, this time to its /token endpoint:

```
POST https://accounts.blackbaud.com/token
```

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

On success, the response from the {{ stache.config.authorization_service_name }} has the status code 200 OK in the response header, and the following JSON data in the response body:


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
			<td>An access token that can be provided in subsequent calls, for example to {{ stache.config.product_name_short }} Web API services. </td>
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
			<td>A token that can be sent to the {{ stache.config.authorization_service_name }} in place of an authorization code. (When the access code expires, send a POST request to the Accounts service <code>/token</code> endpoint, but use this code in place of an authorization code. A new access token will be returned. A new refresh token might be returned too.) </td>
		</tr>
	</tbody>
  </table>
</div>

An example [cURL](http://en.wikipedia.org/wiki/CURL) request and response from the token endpoint will look something like this:

```
curl -H "Authorization: Basic ZjM...zE=" -d grant_type=authorization_code -d code=MQCbtKe...44KN -d redirect_uri=https%3A%2F%2Fwww.foo.com%2Fauth https://accounts.blackbaud.com/token
{
   "access_token": "NgCXRK...MzYjw",
   "token_type": "Bearer",
   "expires_in": 3600,
   "refresh_token": "NgAagA...Um_SHo"
}
```

**6. Use the access token to access the {{ stache.config.product_name_short }} Web API**

The access token allows you to make requests to the {{ stache.config.product_name_short }} Web API on a behalf of a user, for example:
    
```
curl -H "Authorization: Bearer NgCXRK...MzYjw" https://api.blackbaud.com/v1/constituent/342jsdsaq2wqw
```

**7. Requesting access token from refresh token**

Access tokens are deliberately set to expire after a short time, after which new tokens may be granted by supplying the refresh token originally obtained during the authorization code exchange.

The request is sent to the token endpoint of the {{ stache.config.authorization_service_name }}:

```
POST https://accounts.blackbaud.com/token
```

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

```
curl -H "Authorization: Basic ZjM4Zj...Y0MzE=" -d grant_type=refresh_token -d refresh_token=NgAagA...NUm_SHo https://accounts.blackbaud.com/token
{
   "access_token": "NgA6ZcYI...ixn8bUQ",
   "token_type": "Bearer",
   "expires_in": 3600
}
```

## Implicit Grant Flow

Implicit grant flow is for clients that are implemented entirely using JavaScript and running in your application user's browser. You do not need any server-side code to use it.

{{# draft }}

## Client Credentials Flow

{{# withHash priority="medium" note="This needs more work." }}
  {{> partial-note }}
{{/ withHash }}

The Client Credentials flow is used by the developer to access data that is related to their partner client application. This flow is used the **xyz** end points. 

<p class="alert alert-info">The Client Credentials flow does not include authorization and therefore cannot be used to access or manage a user’s private data. This flow is described in <a href="http://tools.ietf.org/html/rfc6749#section-4.4">RFC-6749</a>.</p>

{{/ draft }}

## Using Scopes

{{# withHash priority="medium" note="This is a prototype of scopes documentation.  Scopes have not been defined for the Web API." }}
  {{> partial-note }}
{{/ withHash }}

When your application seeks authorization to access user-related data, you will often need to specify one or more scopes. Here’s how.

Most calls to the {{ stache.config.product_name_short }} Web API require prior authorization by your application’s user. To get that authorization, your application will first need to make a call to the {{ stache.config.authorization_service_name }}’s `/authorize` endpoint, passing along a list of the **scopes** for which access permission is sought.

Scopes let you specify exactly what types of data your application wants to access, and the set of scopes you pass in your call determines what access permissions the user is asked to grant.

Example
The following code makes a request asking for scopes ‘constituent-read’:

```
code sample here
```

On execution, the user is redirected to a page explaining the information that is requested:
	
![Ipsum Image][ipsum-image-04]

### Determining the scopes needed
Check an <a href="{{ getOperationUri name='Constituent (Get)' }}" >endpoint</a> within the {{ stache.config.portal_name }} to see if it does require prior authorization. Usually, authorization is only required for xyz data. For more about authorization see our <a href="{{ stache.config.guide_web_api_authorization }}" >Web API Authorization Guide</a>.


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


{{# draft }}
## CORS

We support cross-origin resource sharing to allow you to interact securely with our API from a client-side web application (though you should remember that you should never expose your secret API key in any public website's client-side code).
{{/ draft }}

## Base URLs

URLs referenced in the documentation to have the following base:

<code>{{ stache.config.portal_base }}</code>

The majority of endpoints access *private* data, such as constituent data.  To access private data an application must get permission from a specific tenant's {{ stache.config.product_name_short }} user.  <a href="{{ stache.config.guide_web_api_authorization }}" > Web API Authorization</a> is done via the {{ stache.config.authorization_service_name }} at the following URL: 

<code>{{ stache.config.authorization_url }}</code>  

## Endpoints

The {{ stache.config.product_name_short }} Web API currently accesses the following top level resource groupings. Click on a link to read the documentation for accessing or modifying each resource:

- <a href="{{ stache.config.guide_constituents }}" >Constituents</a> - Manage a constituent's biographical and constituent information for a specific Blackbaud tenant which includes addresses, email addresses, phones, web addresses, name formats ...
- Solicitor - Manage and list the solicitors for a specific Blackbaud tenant.  Solicitors request contributions to a tenant's organization.  
- Relationships - Manage and list a constituent's familial and social associations.  
- Spouse - Returns spouse and domestic partner information for the specified constituent
- Primary Business - Returns the primary business information for the specified constituent.
- Education - Returns information about the education record with the specified constituent.

## Constituents
Manage a constituent's biographical and constituent information for a specific Blackbaud tenant which includes addresses, email addresses, phones, web addresses, name formats ...

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Endpoint</th>
        <th>Method</th>
      </tr>
	</thead>
	<tbody>

      {{# each operations }}
        <tr>
          <td>{{ name }}</td>
          <td>{{ description }}</td>
          <td>
            <a href="{{ ../stache.config.portal }}{{ getOperationUri name=name }}">{{ urlTemplate }}</a>
          </td>
          <td>{{ method }}</td>
        </tr>
      {{/ each }}

	</tbody>
  </table>
</div>

### Working with Constituents
Here we provide you with tips, tricks, and best practices on using the Constituents endpoints so you can provide your users with a great experience.

### Best Practices
The following best practices are intended to give your users the best experience possible, and make your integration as efficient as possible. 

#### Creating new constituents
This process uses 2 API calls to add a constituent to  {{ stache.config.product_name_short }} constituent, one to determine if it already exists, and one to add it. It is fine to use this process if you are adding a fairly small number of constituents. 

HOW Make a POST call to the Constituents Collection API.

<p class="alert alert-info">BEST PRACTICE Use this workflow for creating a new constituent to prevent receiving an unnecessary 409 return by verifying whether or not the proposed new constituent already exists prior to issuing a POST to create it.</p>


1. Verify that the constituent does not already exist in the Constituents collection:
	Search for the constituent in the user's constituent collection by <a href="" >email address</a> :
	<code>GET: https://api.constantconstituent.com/v2/constituents?email=new_constituent@email.com</code>
	<br>or <a href="" >lookup id</a>:
	<code>GET: https://api.constantconstituent.com/v2/constituents?lookupID=(value)</code>
2. If the constituent does not exist, then proceed with <a href="">creating them</a>. 

## Requests

The {{ stache.config.product_name_short }} Web API is based on REST principles: data resources are accessed via standard HTTPS requests in UTF-8 format to a Web API endpoint. Where possible, the Web API strives to use appropriate HTTP verbs for each action:

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

{{# draft }}

  ### Common Request Headers

  ipsum lorem

{{/ draft }}

## Responses

All data is received as a JSON object.

{{# draft }}

## Version

When we change the Web API in a backwards-incompatible way, we release a new  version.

For the {{ stache.config.product_name_short }} Web API, the URL has a major version number (v1), but the Web API has date based sub-versions which can be chosen using a custom HTTP request header. In this case, the major version provides structural stability of the Web API as a whole while the dated versions account for smaller changes (field deprecation, endpoint changes, etc). 

{{/ draft }}

{{# draft }}

## Backwards-compatible changes

- Adding new Web API resources.
- Adding new optional request parameters to existing Web API methods.
- Adding new properties to existing Web API responses.
- Changing the order of properties in existing Web API responses.
- Changing the length or format of object IDs or other opaque strings. This includes adding or removing fixed prefixes. 
- You can safely assume IDs we generate will never exceed x characters, but you should be able to handle IDs of up to that length. 
{{/ draft }}

{{# draft }}
## API Changelog

The  <a href="{{ stache.config.resources_changelog }}" >Change Log</a> reflects backwards-incompatible updates, backward compatible updates, removed features due to planned deprecation, features marked for future planned deprecation, and fixes for bugs or known issues. Make sure you’re subscribed to our blog and API mailing list to keep up with API changes.
{{/ draft }}

{{# draft }}
##Timestamps

Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with zero offset: YYYY-MM-DDTHH:MM:SSZ. 
{{/ draft }}

{{# draft }}
##Pagination

Some endpoints support a way of paging the dataset, taking an offset and limit as query parameters:

```
$ curl "https://api.blackbaud.com/v1/constituents?offset=20&limit=10"
```
Note that offset numbering is zero-based and that omitting the offset parameter will return the first X elements. Check the technical reference for the specific endpoint to see the default limit value. Requests that return an array of items are automatically paginated if the number of items vary (for example, addresses for a constituent). 
{{/ draft }}

{{# draft }}
##Response Status Codes

The API uses the following response status codes, as defined in the RFC 2616 and RFC 6585:
{{/ draft }}

{{# draft }}
## Web API Fundamentals

ipsum lorem
{{/ draft }}

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