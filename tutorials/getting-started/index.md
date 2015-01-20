---
layout: content
priority: high
note: |  
  <p>Problem -  You don’t make it easy.</p>
  <p>Best Practice - Minimize friction by providing a “Getting Started” guide.  Explain the steps to get going.  Explain how to set up an developer account, get an API key, start using the API console and trying the API, point them to authentication documentation, code samples, other tutorials, blog, mailing list, forum.  </p>
  <p>Benchmark -  <a href="http://developer.constantcontact.com/get-started.html" target="_blank">Constant Contact</a></p> 
  <p>Note - This is a prototype. The details surrounding registering an client application and developer environment provisioning are a work in progress.  As those details emerge they will be reflected in this guide. </p> 
---

# Get Started with the {{ site.productname }} API #

Ready to integrate with {{ site.productname }}? We've made it easy for you to get started in a matter of minutes. Our documentation and {{ site.devportalname }} deliver a development experience that gives you the information and tools that you need to quickly integrate your apps with {{ site.productname }}.  

This tutorial introduces our developer portal, developer sign up process, technical reference, and interactive API Console.  By successfully completing this tutorial you will begin test driving the API by making actual API calls.

## Step 1 - Set up your developer account ##
Within our {{ site.devportalname }}, you can [set up] a new developer account or [log back in] if you're a returning developer.

![Ipsum Image][ipsum-image-00]

## Step 2 - Get your API key ##
The API key is assigned to an individual developer in order to access the API.  The API key is associated with your developer account.  To obtain an API key, you <a href="{{ site.devportalurlsubscribeproduct }}" target="_blank">subscribe to an API Product</a>. If you are new to our API, we recommend that you subscribe to the **Starter** product because it does not require approval by a Blackbaud API administrator. Partners can subscribe to the **Unlimited** product that requires approval by a Blackbaud API administrator.  

{% include note.html priority='medium' note='To Do: The organization of API products and associated API endpoints are still a work in progress. This step needs to be updated as the API product(s) is organized. <p>To Do: The partner details need to be discussed with the global partnership team</p>' %}
 
 After you subscribe to a product, a primary key and a secondary key will be created.  These keys are visible in the product subscription details: 
  ![Ipsum Image][ipsum-image-00]

<p class="alert alert-info">When interacting with the API Console within the developer portal, you will need to provide an API Key value for the subscription-key URI parameter. The primary key associated with your subscription to a particular API product represents the API key value for this URI parameter.</p>
![Ipsum Image][ipsum-image-00]

## Step 3 - Create an {{ site.productname }} user account  ##

{% include note.html priority='medium' note='As part of MVP, the creation of an trial RENXT user account may not be initially auto- provisioned, create content here that explains how the  trial RENXT user account is created. This step may be unnecessary for partners if we eventually provision an RENXT sandbox for each partner dev. The automatic creation of an RENXT user may also be done as part of this process.' %}

In addition to an API key, you'll need a valid OAuth 2.0 access token. The API access token represents an {{ site.productname }} user's authorization to the API Console to access protected {{ site.productname }} API resources.  The first step to obtain an OAuth 2.0 access token is to create a trial {{ site.productname }} user account.


![Ipsum Image][ipsum-image-00]

## Step 4 - Generate an OAuth 2.0 access token  ##
After you create a trial {{ site.productname }} user account, you need to generate an OAuth 2.0 access token to represent that {{ site.productname }} user's authorization to the API Console. The access token allows the API Console to access the user's protected resources (data) within {{ site.productname }}.  Once you have an access token, you can provide any necessary URI parameters followed by submitting the request.  For example, use the API Console to perform a GET to retrieve a list of Constituent resources. 

{% include note.html priority='medium' note='The best, initial call to make within the console is TBD.  GETting a list of constituent makes sense if such as endpoint is created.' %}

To generate an access token, follow these steps:

1. Open the <a href="{{ site.devportalurl }}" target="_blank">{{ site.devportalname }}</a>
2. Click **APIs** in the top menu and select the **Constituent** API.
3. Select **Constituent (List)** resource and operation from the list. 
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


## Step 5 - Get to know our resources and support
Finally, you can familiarize yourself with our documentation and {{ site.devportalname }} to get all the support you need.  

- Take a deeper dive into security and OAuth with our <a href="{{ '/guide/#web-api-authorization' | prepend: site.baseurl }}">Web API Authorization guide</a> and <a href="{{ '/tutorials/auth/' | prepend: site.baseurl }}">tutorial</a>.
- Explore developer <a href="{{ '/resources/' | prepend: site.baseurl }}">resources</a> such as tutorials, code samples, and a change log.
- Explore developer <a href="{{ '/support/' | prepend: site.baseurl }}">support</a> such as tutorials, code samples, and a change log.
- Keep up to date on the latest news and changes through our <a href="{{ site.communityblogurl }}">blog</a>. 


[ipsum-image-00]: http://placehold.it/800x300
[ipsum-image-01]: http://placehold.it/800x800
[ipsum-image-02]: http://placehold.it/800x200
[ipsum-image-03]: http://placehold.it/800x200

[ipsum-image-00A]: holder.js/800x300
[ipsum-image-01A]: holder.js/800x800
[ipsum-image-02A]: holder.js/800x200
[ipsum-image-03A]: holder.js/800x200/sky

[set up]: {{ '/signup/' | prepend: site.devportalurl }}
[log back in]: {{ '/signin/' | prepend: site.devportalurl }}
[subscribe to an API Product]:  {{ '/products/' | prepend: site.devportalurl }}[Starter]: https://
