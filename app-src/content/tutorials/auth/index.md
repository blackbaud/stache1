---
layout: sidebar
priority: high
note: |  
  <p>Problem -  You don’t make it easy.</p>
  <p>Best Practice - Provide clear instructions and samples on how to negotiate OAuth.</p>
  <p>Benchmark -  <a href="https://developer.spotify.com/web-api/tutorial/" target="_blank">Web API Tutorial</a></p>
  <p>TO DOs:</p> 
  <ul>
  <li>The details surrounding registering an client application, tenant, and developer environment provisioning are a work in progress.  As those details emerge they will be reflected in this guide.</li>
  <li><a href="{{ site.legal }}" >Developer Terms of Use</a> will need to be finalized with legal.  Also need to provide a way for the user to accept the terms of use (Accept button with email to legal?)</li>
  <li>As part of MVP, the creation of an trial RE NXT user account and sandbox may not be initially auto-provisioned.  The developer will need a sandbox database and an NXT user account to play around with the API. Once the process (manual or auto) for creating a sandbox and NXT user account has been finalized, create content that guides the reader on how to create a trial NXT user account for a specific tenant. Include necessary images. </li>
  <li>SDK Docs will need to create a Web API Authorization tutorial project from GitHub. This code serves as a starter project for working through the OAuth 2.0 Authorization Code flow. Steps 5 through 10 require completion.</li>
  </ul>
---

<p class="alert alert-danger">Draft: This content is a work in progress.  For a list of dependencies and To Do list, click the bottom right info icon.</p>

<!--
## TO DO

-->

# Web API Authorization Tutorial #

This tutorial shows you how to create a small server-side application that accesses user-related data through the  {{ site.product_name_short }} Web API.

<p class="alert alert-info">Note that by using Blackbaud developer tools, you accept our <a href="{{ site.legal }}" >Developer Terms of Use</a>. </p>

Through the {{ site.product_name_short }} Web API, external applications can retrieve {{ site.product_name_short }} content such as constituent data and events. If an application wants to access user-related data through the Web API, it must get the user’s authorization to access that data.

This tutorial is based around the creation of a simple application using ASP.NET MVC.   We will show you how to:

- Register your application with Blackbaud.
- Authenticate a user
- Get authorization to access the user’s data for a specific tenant
- Retrieve data from a {{ site.product_name_short }} Web API's  `/Constituent` endpoint

The authorization flow we will use in this tutorial is the **Authorization Code** flow. See <a href="{{ site.guide_web_api_authorization }}" >Web API Authorization</a>.    This flow first gets a code from the {{ site.authorization_service_name }}, then exchanges that code for an access token. The code-to-token exchange requires a **Client Secret**, and for security is done through direct server-to-server communication. 

## Step 1 - Sign up for your Blackbaud account

To be able to use the Web API as a developer, the first thing you will need is a Blackbaud user account.  To get one, simply <a href="{{ site.portal_signup }}" target="_blank" >sign up</a>.

Once you have your own user account, read and accept the latest <a href="{{ site.legal }}" target="_blank" >Developer Terms of Use</a> to complete the set-up of your account.

## Step 2 - Register your application
If you haven't already done so, you will need to <a href="{{ site.guide_registering_your_app }}" target="_blank" >register your application</a> with our {{ site.authorization_service_name }}.  You will need to provide your app name, description, web site address, and your URI redirects.  

## Step 3 - Getting your Client ID and Secret Key

When you register an application on your account, two credentials are created for you. You will need them to make calls from your application to the {{ site.product_name_short }} Web API. You can see the credentials on the application’s details page:

![Ipsum Image][ipsum-image-00]

- **Client ID** is the unique identifier for your application. It does not need to be stored securely and usually it does not need to be changed. (If for some reason you do need to change the client ID, you will need to delete your application from your account and register it again.)
- **Client Secret** is the key that you will need to pass in secure calls to the {{ site.authorization_service_name }} and {{ site.product_name_short }} Web API services.

<p class="alert alert-warning">Important! Keep the <b>Client Secret</b> secure! Regenerate your <b>Client Secret</b> if you suspect it has been compromised! You should never expose the secret in your code.  You should take special care to never store the secret on the client, such as a native mobile or browser-based apps.</p>

##Step 4 - Create an {{ site.product_name_short }} user account##



Before you can access an end user's data for a specific tenant via the Web API, you'll need a valid OAuth 2.0 access token. The access token represents an {{ site.product_name_short }} user's authorization for your application to access protected {{ site.product_name_short }} API resources.  The first step to obtain an OAuth 2.0 access token is to create a trial {{ site.product_name_short }} user account.

![Ipsum Image][ipsum-image-00]

## Step 5 - Preparing Your Environment 

Now that you have registered our application, we need to set up your environment. We’ll describe how to do that now.

Because we are creating a server-side application in this tutorial, we will need the help of an appropriate software platform. For this, we will use .NET MVC 4.

## Step 6 - Creating the Project

Let's clone the Web API Authorization tutorial project from <a href="{{ site.github_repo_web_api_authorization }}" target="_blank">GitHub</a>.  This code serves as a starter project for working through the OAuth 2.0 Authorization Code flow.

## Step 7 - Prompting the User to Login

Let’s examine the code of the Web API Authorization tutorial project.

Open the file xyz. This file provides a simple interface that prompts the user to login:

    sample code goes here

## Step 8 - Providing the Application Credentials

The file called app.cs contains the main code of our application. Open it in an editor and you will find that it contains code for:

- Creating a server on your local machine,
- Handling the user’s login request,
- Specifying the scopes for which authorization is sought,
- Performing the exchange of the authorization code for an access token,
- Calling the Web API endpoint.

There are some lines of code in this file containing the client ID, secret key and redirect URI:

    string my_client_id = 'CLIENT_ID'; // Your client id
    string my_secret = 'CLIENT_SECRET'; // Your secret
    string redirect_uri = 'REDIRECT_URI'; // Your redirect uri

They contain sample values, so if you want to try the app out we recommend that you replace them with the values that you were given when you registered your app. 

You can also see in this file the data scopes that we are going to ask the user for authorization to access:

    string scopes = 'constituent-read';

That means that the app will be requesting access to read all constituents and sub resources for a particular tenant.  See  <a href="{{ site.guide_using_scopes }}" target="_blank" >Using Scopes</a> for more information.

## Step 9 - Calling the {{ site.authorization_service_name }}

The first call is the service’s `/authorize` endpoint, passing to it the client ID, scopes, and redirect URI. This is the call that starts the process of authenticating to user and gets the user’s authorization to access data.

The second call is to the {{ site.authorization_service_name }}’s `/token` endpoint, passing to it the authorization code returned by the first call and the client secret key. This second call returns an access token and also a refresh token.

<p class="alert alert-warning">Note that our app.cs machinations cannot be seen from a web browser. This is important because we never want to expose our application’s Client Secret to a user. Make sure that you safeguard your application’s Client Secret at all times. Be aware, for example, that if you commit your code to a public repository like GitHub you will need to remove the secret key from your code before doing so.</p>

For a better understanding of the Accounts Service’s endpoints and the parameters passed in each call, see the full description of the Authorization Code Flow in our <a href="{{ site.guide_web_api_authorization }}" >Web API Authorization</a>.

After both calls have been completed (and the user has authorized access), the application will have the **access_token** it needs to retrieve the user data from the Web API.

The third call, in the code managing requests to `/refresh_token`, a refresh token is sent to `/token`. This will generate a new access token that we can issue when the previous has expired.

## Step 10 - Running the application

ipsum lorem

![Ipsum Image][ipsum-image-00]


[ipsum-image-00]: http://placehold.it/800x300
[ipsum-image-01]: http://placehold.it/800x800
[ipsum-image-02]: http://placehold.it/800x200
[ipsum-image-03]: http://placehold.it/800x200

[ipsum-image-00A]: holder.js/800x300
[ipsum-image-01A]: holder.js/800x800
[ipsum-image-02A]: holder.js/800x200
[ipsum-image-03A]: holder.js/800x200/sky


