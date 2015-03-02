---
layout: sidebar
priority: high
note: |  
  <p>Problem -  You don’t make it easy.</p>
  <p>Best Practice - Minimize friction by providing a “Getting Started” guide.  Explain the steps to get going.  Explain how to set up an developer account, get an API key, start using the API console and trying the API, point them to authentication documentation, code samples, other tutorials, blog, mailing list, forum.  </p>
  <p>Benchmark -  <a href="http://developer.constantcontact.com/get-started.html" target="_blank">Constant Contact</a></p> 
  <p>TO DOs:</p> 
  <ul>
  <li>The partner will have to obtain a Tenant ID. The workflows surrounding obtaining a tenant id and a provisioned developer environment is TBD.  The workflow that a partner would use to obtain a Tenant ID for the API console is currently undefined. See Step 4 below.</li>
  <li>Blackbaud Authorization service is under construction.  This tutorial will be updated once the sign-in form for the Blackbaud OAuth 2.0 provider is created.</li>
  <li>The organization of API products and associated API endpoints are still a work in progress. This tutorial will require updating once the API product(s) is organized.  See Step 2 below.</li>
  <li>As part of MVP, the creation of an trial RE NXT user account may not be initially auto-provisioned.  SDK docs will need to create content here that explains how the  trial RENXT user account is created. The trial RE NXT user account is provided to the sign-in form of the Blackbaud OAuth 2.0 provider.  See Steps 3 and 4.</li>
  <li>Retrieving a list of constituents or performing a constituent search makes sense if such endpoints are created. Adjust Step 4 to the appropriate endpoint after the endpoint is created. </li>
  </ul>
---

<p class="alert alert-danger">Draft: This content is a work in progress.  For a list of dependencies and To Do list, click the bottom right info icon.</p>

<!--
## TO DO

  <ul>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  </ul>
-->

# Get Started with the {{ stache.config.product_name_short }} API #

Ready to integrate with {{ stache.config.product_name_short }}? We've made it easy for you to get started in a matter of minutes. Our documentation and {{ stache.config.portal_name }} deliver a development experience that gives you the information and tools that you need to quickly integrate your apps with {{ stache.config.product_name_short }}.  

This tutorial introduces our developer portal, developer sign up process, technical reference, and interactive API Consol and developer resources.  By successfully completing this tutorial, you will obtain the necessary knowledge to make API calls using our interactive API console.  

## Step 1 - Set up your developer account ##
Within our {{ stache.config.portal_name }}, you can [set up] a new developer account or [log back in] if you're a returning developer.

![Ipsum Image][ipsum-image-00]

## Step 2 - Get your API key ##
The API key is assigned to an individual developer in order to access the API.  The API key is associated with your developer account.  To obtain an API key you will need to <a href="{{ stache.config.portal_products }}" target="_blank">subscribe to an API Product</a> and select **Raiser's Edge NXT** from the list of products. 

 After you subscribe to a product, a primary key and a secondary key will be created.  These keys are visible in the product subscription details: 
  ![Ipsum Image][ipsum-image-00]

<p class="alert alert-info">When interacting with the API Console within the developer portal, you will need to provide an API Key value for the subscription-key URI parameter. The primary key associated with your subscription to a particular API product represents the API key value for this URI parameter.</p>
![Ipsum Image][ipsum-image-00]

## Step 3 - Create an {{ stache.config.product_name_short }} user account  ##

In addition to an API key, you'll need a valid OAuth 2.0 access token. The API access token represents an {{ stache.config.product_name_short }} user's authorization to the API Console to access protected {{ stache.config.product_name_short }} API resources.  The first step to obtain an OAuth 2.0 access token is to create a trial {{ stache.config.product_name_short }} user account.


![Ipsum Image][ipsum-image-00]

## Step 4 - Generate an OAuth 2.0 access token  ##
After you create a trial {{ stache.config.product_name_short }} user account, you need to generate an OAuth 2.0 access token to represent that {{ stache.config.product_name_short }} user's authorization to the API Console. The API Console acts as a client application that attempts to access private resources (data) within  {{ stache.config.product_name_short }}.  The access token allows the API Console to access the user's protected resources within {{ stache.config.product_name_short }}.  Once you have an access token, you can provide any necessary URI parameters followed by submitting the request.  For example, use the API Console to perform a GET to retrieve a list of Constituent resources. 

To generate an access token, follow these steps:

1. Within the {{ stache.config.portal_name }}, open <a href="{{ stache.config.portal_products }}">Products</a> and select **Raiser's Edge NXT**.
2. Select the **Constituent** API.  A list of endpoints will be displayed.
3. Select **Constituent (To Be Determined)** resource and operation from the list endpoints. 
4. Click **Open Console** 
5. Provide the value for the <code>tenantID</code> URI parameter.
6. Configure the required URI parameter for the <code>subscription-key</code>. Select your primary API key as the value.
7. Select **Authorization Code** from the drop-down. 
8. When **Authorization Code** is selected, a pop-up window is displayed with the sign-in form of the Blackbaud OAuth 2.0 provider.  *Note:  If you have pop-ups disabled you will be prompted to enable them by the browser. After you enable them, select Authorization code again and the sign-in form will be displayed.*
9. You should sign in the with trial {{ stache.config.product_name_short }} user account.  Once you have signed in, the **Request headers** are populated with the <code>Authorization:Bearer</code> header that authorizes the request.  This represents the access token for the request. 
7.
10. Once you have a bearer token and have configured all the desired values for the URI parameters, you can submit the request by selecting **HTTP GET**. 

If successful, you should see the generated Requested URL, status, latency, headers, and content.

![Ipsum Image][ipsum-image-00]

## Step 5 - Get to know our resources and support
Finally, you can familiarize yourself with the rest of our documentation and {{ stache.config.portal_name }} to get all the support you need.  

- Learn how to <a href="{{ stache.config.guide_registering_your_app }}">Register your application</a> with our Web API. 
- Take a deeper dive into security and OAuth with our <a href="{{ stache.config.guide_web_api_authorization }}">Web API Authorization guide</a> and <a href="{{ stache.config.tutorials_auth }}">tutorial</a>.
- Use the <a href="{{ stache.config.portal }}" target="_blank">{{ stache.config.portal_name }}</a> to manage your developer account and explore the RE NXT API, including details for each endpoint, status codes, and an interactive console.
- Explore developer <a href="{{ stache.config.resources }}">resources</a> such as:
	- Blog
	- Forum
	- FAQ
	- Change log
	- Code samples
	<!-- API Status -->  


[ipsum-image-00]: http://placehold.it/800x300
[ipsum-image-01]: http://placehold.it/800x800
[ipsum-image-02]: http://placehold.it/800x200
[ipsum-image-03]: http://placehold.it/800x200

[ipsum-image-00A]: holder.js/800x300
[ipsum-image-01A]: holder.js/800x800
[ipsum-image-02A]: holder.js/800x200
[ipsum-image-03A]: holder.js/800x200/sky

[set up]: {{ stache.config.portal_signup }}
[log back in]: {{ stache.config.portal_signin }}
[subscribe to an API Product]:  {{ stache.config.portal_products }}
[Starter]: '#'
