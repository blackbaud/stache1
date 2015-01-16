---
layout: content
priority: high
note: |
  This is a prototype.  As the API matures, this content will change. 
  
  This tutorial will help developers start integrating with {{ site.productname }}. It will make it easy to get started in a few steps. It will guide users through the Azure API management platform, including setting up a developer account, logging in, getting API keys, using the technical reference and interactive API console.  At the end of the tutorial, we will orient the user to the various resources available to them . 
---

# Get Started with the {{ site.productname }} API #

> This is a prototype.  The details surrounding registering an client application and developer environment provisioning are a work in progress.  As those details emerge they will be reflected in this guide.  

Ready to integrate with {{ site.productname }}? We've made it easy for you to get started in a matter of minutes. Our documentation and {{ site.devportalname }} deliver a development experience that gives you the information and tools that you need to quickly integrate your apps with {{ site.productname }}.  

This tutorial introduces our developer portal, developer sign up process, technical reference, and interactive API console.  By successfully completing this tutorial you will begin test driving the API by making actual API calls.

## Step 1 - Set up your developer account ##
Within our {{ site.devportalname }}, you can [set up] a new developer account or [log back in] if you're a returning developer.

![Ipsum Image][ipsum-image-00]

## Step 2 - Get your API keys ##
To obtain API keys, you <a href="{{ site.devportalurlsubscribeproduct }}" target="_blank">subscribe to an API Product</a>. If you are new to our API, we recommend that you subscribe to the **Starter** product because it does not require approval by a Blackbaud API administrator. Partners can subscribe to the **Unlimited** product that requires approval by a Blackbaud API administrator.  

<p class="alert alert-info">The API keys include a primary key and a secondary key. Use the primary key as the API key, and use the secondary key as the secret API key.</p>

> To Do: The organization of API products and associated API endpoints are still a work in progress. This step needs to be updated as the API product(s) is organized.
>
> To Do: The partner details need to be discussed with the global partnership team
>
> To Do: Verify which keys (primary and/or secondary API key) are used as the public API key and secret API key.
 
 After you subscribe to a product, your API keys are visible in the subscription details.

![Ipsum Image][ipsum-image-01]

## Step 3 - Create an {{ site.productname }} user account  ##
Before you can use the API Console to try out the API, you'll need an API key and a valid OAuth 2.0 access token. The first step to obtain an OAuth 2.0 access token is to create a trial {{ site.productname }} user account.

> To Do:  If the creation of an trial {{ site.productname }} user account is not auto provisioned, create content here that guides the reader on how to create a trial {{ site.productname }} user account. Include necessary images.

> Note to Doc/API Team: This step may be unnecessary for partners if we eventually provision an {{ site.productname }} sandbox for each partner dev. The automatic creation of an {{ site.productname }} user may also be done as part of this process. Either way, the API Console needs an access token that represents an {{ site.productname }} user's authorization to the API Console to access protected {{ site.productname }} API resources.

![Ipsum Image][ipsum-image-00]

## Step 4 - Generate an OAuth 2.0 access token  ##
After you create a trial {{ site.productname }} user account, you need to generate an OAuth 2.0 access token to represent that {{ site.productname }} user's authorization to the API Console. The access token allows the API Console to access the user's protected resources (data) within {{ site.productname }}.  Once you have an access token, you can provide any necessary URI parameters followed by submitting the request.  For example, use the API Console to perform a GET on the Constituent resource to retrieve Robert Hernandez. 

To generate an access token, follow these steps:

1. Open the <a href="{{ site.devportalurl }}" target="_blank">{{ site.devportalname }}</a>
2. Click **APIs** in the top menu and select the **Constituent** API.
3. Select **Constituent (Get)** resource and operation from the list. 
4. Click **Open Console** and then select **Authorization Code** from the drop-down. 
5. When **Authorization Code** is selected, a pop-up window is displayed with the sign-in form of the Blackbaud OAuth 2.0 provider.  *Note:  If you have pop-ups disabled you will be prompted to enable them by the browser. After you enable them, select Authorization code again and the sign-in form will be displayed.*
6. You should sign in the with trial {{ site.productname }} user account.  Once you have signed in, the **Request headers** are populated with the `Authorization:Bearer` header that authorizes the request.  This represents the access token for the request. 
7. Configure the required URI **constituentId** parameter by adding a value of XYZ.
8. Configure the required URI parameter for the **subscription-key**. Select your primary API key as the value.
9. Once you have configured all the desired values for the URI parameters, you can submit the request by selecting **HTTP GET**. 

If successful, you should see the generated Requested URL, status, latency, headers, and content.

> TO DO:  In the list of steps above, it would be preferable to use a resource that lists constituents rather than Constituent (GET).  In that way you would retrieve a list of constituentId's that could be used at a later time to perform a Constituent (GET) or a Constituent (Update).  

>TO DO: The steps above may require additional URI parameters (tenand id?)

![Ipsum Image][ipsum-image-00]


![Ipsum Image][ipsum-image-00]

## Step 5 - Get to know our resources and support
Finally, you can familiarize yourself with our documentation and {{ site.devportalname }} to get all the support you need.  

- Take a deeper dive into security and OAuth with our <a href="{{ '/guide/#web-api-authorization' | prepend: site.baseurl }}">Web API Authorization guide</a> and <a href="{{ '/tutorials/auth/' | prepend: site.baseurl }}">tutorial</a>.
- Explore developer <a href="{{ '/resources/' | prepend: site.baseurl }}">resources</a> such as tutorials, code samples, and a change log.
- Explore developer <a href="{{ '/support/' | prepend: site.baseurl }}">support</a> such as tutorials, code samples, and a change log.
- Keep up to date on the latest news and changes through our <a href="{{ site.communityblogurl }}">blog</a>. 

[ipsum-image-00]: holder.js/800x300
[ipsum-image-01]: holder.js/800x800
[ipsum-image-02]: holder.js/800x200
[set up]: https://bbbobbyearl.portal.azure-api.net/
[log back in]: https://bbbobbyearl.portal.azure-api.net/signin
[subscribe to an API Product]: 
[Starter]: https://bbbobbyearl.portal.azure-api.net/Products/5485eb288f29c10414060001