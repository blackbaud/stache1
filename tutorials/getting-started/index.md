---
layout: content
priority: high
note: |
  This is a prototype.  As the API matures, this content will change. 
  
  This tutorial will help the dev start integrating with constant contact.  It will make it easy to get started in a few steps.  It will guide the user through the Azure API management platform including setting up a developer account, logging in, getting api keys, starting your integration, using the technical reference and api console, orienting the user to the developer guides, authentication, tutorials, support and resources. 
---

# Get Started with the {{ site.productname }} API #

Ready to start integrating with {{ site.productname }}? We've made it easy for you to get started in just a few short steps. Our docs coupled with our {{ site.devportalname }} deliver a development experience that gives you the information and tools you need to quickly get your apps integrated with {{ site.productname }}.  

The goals of this tutorial will be to get you signed up and and begin test driving our api.

1. Get you signed up as a developer within the developer portal
2. Subscribe to an api product and get your API key
3. Create a {{ site.productname }} user 
4. Generate an OAuth 2.0 Access Token
5. Test drive the API with our API Console
6. Get to know our resources and support

## Step 1 - Set up your developer account ##
Within our {{ site.devportalname }} [set up] your developer account or [log in] if you're a returning developer. 

![Ipsum Image][ipsum-image-00]


## Step 2 - Get your API keys ##
You obtain an API keys by [subscribing to an API Product] such as a Starter product or Unlimited product.  If you are new to our API, we recommend subscribing to the [Starter] product as it does not require approval by a Blackbaud API administrator.  Partners can subscribe to the Unlimited product which requires approval by a Blackbaud API administrator.  

<p class="alert alert-info">The API keys will consist of a primary key and a secondary key.  Use the primary key as  API key and the secondary key as the secret API key.</p>

> To Do: The organization of API products and APIs are still a work in progress.  This step will need to be updated as the API is organized.
>
> To Do: The partner details will need to be discussed with global partnership team and represented within the /partners area of the docs.
>
> To Do: Verify which keys  (primary and/or secondary API key) are used as the public API key and secret API key.
 
 Once you have subscribed to a product, your keys will be visible within the subscription details.
![Ipsum Image][ipsum-image-01]

## Step 3 - Create a {{ site.productname }} user  ##
Before you can use the API Console to try out the api, you will need an API key and a valid OAuth 2.0 access token. The first step in obtaining an OAuth 2.0 access token is to create a trial {{ site.productname }} user account for an RE NXT user.  

> Note to Doc/API Team:  This step may be unnecessary for partners if we eventually provision an RE NXT sandbox for each partner dev. The automatic creation of an {{ site.productname }} user may also be done as part of this process.  Either way, the API Console will need an access token which represents {{ site.productname }} use's authorization to the API Console to access protected {{ site.productname }} API resources.

![Ipsum Image][ipsum-image-00]

## Step 4 - Generate an OAuth 2.0 Access Token  ##
Once you have created a {{ site.productname }} trial user, we will generate an OAuth 2.0 access token that represents the {{ site.productname }} trial user's authorization to the API Console. This allows the API Console access to the {{ site.productname }} trial user's protected resources (data) within {{ site.productname }}.

Generating an access token involves the following steps 

1. Authenticate the new {{ site.productname }} trial user with the Blackbaud Auth service 
2. Allow the API console to have access to the user's protected resources (data) within {{ site.productname }}
3. Generate an OAuth 2.0 access token. This represents the {{ site.productname }} trial user's authorization to the API Console.  

![Ipsum Image][ipsum-image-00]

## Step 5 - Test drive the API with our API Console ##
Now that we have the API key and valid  OAuth 2.0 access token, we can test drive the API by making API calls using API Console.  Let's start by viewing the API technical reference and then performing a GET to retrieve Robert Hernandez. 

![Ipsum Image][ipsum-image-00]

## Step 6 - Get to know our resources and support
Get all the support you need.  

- Take a deeper dive into security with our <a href="{{ '/guide/#web-api-authorization' | prepend: site.baseurl }}">Web API Authorization</a> guide and <a href="{{ '/tutorials/auth/' | prepend: site.baseurl }}">tutorial</a>.

We provide developer <a href="{{ '/resources/' | prepend: site.baseurl }}">resources</a> that 

Our <a href="{{ site.communityblogurl }}">blog</a> keeps you up to date on the latest news and changes. 




Over in our {{ site.devportalname }} explore the rest of the end points via API documentation, blogs and forums.



[ipsum-image-00]: holder.js/800x300
[ipsum-image-01]: holder.js/800x800
[ipsum-image-02]: holder.js/800x200
[Set up]: https://bbbobbyearl.portal.azure-api.net/
[log in]: https://bbbobbyearl.portal.azure-api.net/signin
[subscribing to an API Product]: https://bbbobbyearl.portal.azure-api.net/products
[Starter]: https://bbbobbyearl.portal.azure-api.net/Products/5485eb288f29c10414060001