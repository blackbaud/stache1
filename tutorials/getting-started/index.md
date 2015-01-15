---
layout: content
priority: high
note: |
  This is a prototype.  As the API matures, this content will change. 
  
  This tutorial will help developers start integrating with constant contact. It will make it easy to get started in a few steps. It will guide users through the Azure API management platform, including setting up a developer account, logging in, getting API keys, starting the integration, using the technical reference and API console, orienting the user to the developer guides, authentication, tutorials, support and resources. 
---

# Get Started with the {{ site.productname }} API #

Ready to integrate with {{ site.productname }}? We've made it easy for you to get started in just a few short steps. Our documentation and {{ site.devportalname }} deliver a development experience that gives you the information and tools that you need to quickly integrate your apps with {{ site.productname }}.  

This tutorial guides you through the steps to sign up and start test-driving the API.

1. Sign up as a developer in the developer portal.
2. Subscribe to an API product and get your API keys.
3. Create an {{ site.productname }} user account.
4. Generate an OAuth 2.0 access token.
5. Test-drive the API with our API Console.
6. Get to know our resources and support.

## Step 1 - Set up your developer account ##
Within our {{ site.devportalname }}, you can [set up] a new developer account or [log back in] if you're a returning developer.

![Ipsum Image][ipsum-image-00]


## Step 2 - Get your API keys ##
To obtain API keys, you [subscribe to an API Product]. If you are new to our API, we recommend that you subscribe to the [Starter] product because it does not require approval by a Blackbaud API administrator. Partners can subscribe to the Unlimited product that requires approval by a Blackbaud API administrator.  

<p class="alert alert-info">The API keys include a primary key and a secondary key. Use the primary key as the API key, and use the secondary key as the secret API key.</p>

> To Do: The organization of API products and APIs are still a work in progress. This step needs to be updated as the API is organized.
>
> To Do: The partner details need to be discussed with the global partnership team and represented within the /partners area of the docs.
>
> To Do: Verify which keys (primary and/or secondary API key) are used as the public API key and secret API key.
 
 After you subscribe to a product, your API keys are visible in the subscription details.

![Ipsum Image][ipsum-image-01]

## Step 3 - Create an {{ site.productname }} user account  ##
Before you can use the API Console to try out the API, you need the API key and a valid OAuth 2.0 access token. The first step to obtain an OAuth 2.0 access token is to create a trial {{ site.productname }} user account.

> Note to Doc/API Team: This step may be unnecessary for partners if we eventually provision an {{ site.productname }} sandbox for each partner dev. The automatic creation of an {{ site.productname }} user may also be done as part of this process. Either way, the API Console needs an access token that represents an {{ site.productname }} user's authorization to the API Console to access protected {{ site.productname }} API resources.

![Ipsum Image][ipsum-image-00]

## Step 4 - Generate an OAuth 2.0 access token  ##
After you create a trial {{ site.productname }} user account, you need to generate an OAuth 2.0 access token to represent the {{ site.productname }} user's authorization to the API Console. The token allows the API Console to access the user's protected resources (data) within {{ site.productname }}.

To generate an access token, follow these steps:

1. Authenticate the new {{ site.productname }} trial user with the Blackbaud Auth service.
2. Allow the API Console to access to the user's protected resources (data) within {{ site.productname }}.
3. Generate an OAuth 2.0 access token. This represents the {{ site.productname }} user's authorization to the API Console.  

![Ipsum Image][ipsum-image-00]

## Step 5 - Test drive the API with the API Console ##
After you have the API key and OAuth 2.0 access token, you can test-drive the API by making API calls with the API Console. For example, you can start by viewing the API technical reference and then performing a GET to retrieve Robert Hernandez. 

![Ipsum Image][ipsum-image-00]

## Step 6 - Get to know our resources and support
Finally, you can familiarize yourself with our documentation and {{ site.devportalname }} to get all the support you need.  

- Take a deeper dive into security with our <a href="{{ '/guide/#web-api-authorization' | prepend: site.baseurl }}">Web API Authorization guide</a> and <a href="{{ '/tutorials/auth/' | prepend: site.baseurl }}">tutorial</a>.

- Explore developer <a href="{{ '/resources/' | prepend: site.baseurl }}">resources</a> such as tutorials, code samples, and a change log.

- Keep up to date on the latest news and changes through our <a href="{{ site.communityblogurl }}">blog</a>. 


[ipsum-image-00]: holder.js/800x300
[ipsum-image-01]: holder.js/800x800
[ipsum-image-02]: holder.js/800x200
[set up]: https://bbbobbyearl.portal.azure-api.net/
[log back in]: https://bbbobbyearl.portal.azure-api.net/signin
[subscribe to an API Product]: https://bbbobbyearl.portal.azure-api.net/products
[Starter]: https://bbbobbyearl.portal.azure-api.net/Products/5485eb288f29c10414060001