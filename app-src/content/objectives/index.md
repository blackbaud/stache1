---
layout: container
---

# Site Objectives

This content serves to communicate the objectives of thee
developer.blackbaud.com\renxt website which aligns with industry best practice for an API program.  The result is a general departure from how Blackbaud has documented and supported it's SDK and API efforts in the past.  See  <a href="#resources" class="alert-link">Resources</a>. This content is for internal use only.  

## Make it easy
1.	Provide an easy way to sign up for the API. Provide single sign on for as many of the pieces of the developer ecosystem, as possible.
2.	Provide a <a href="{{ site.tutorials_getting_started }}" >Getting Started Tutorial</a>.  Explain how to set up a developer account, get an API key, introduce authorization, and start learning the API via the API console.
3.	Get them over the Authorization hump.  Authorization and security is the first major hurdle outside developer encounter.  Document <a href="{{ site.guide_web_api_authorization }}" >authorization</a> and provide a <a href="{{ site.tutorials_auth }}" >tutorial</a> with associated <a href="https://github.com/blackbaud-community/RENXT-WebAPI-Authorization/">code sample</a> to speed learning.  
4.	Add additional tutorials and associated code samples over time as the API endpoints mature. 
5.	API providers should have a GitHub presence to house code samples and any future SDK library wrappers.
6.	Azure API Management will provide <a href="{{ site.portal_analytics }}" >analytics</a> on API usage, health, and activity.

## Big Picture
1.	SDK Docs will provide the big picture.  Within the developer web site, we will make it clear, simple and bold.
Examples:
- [https://www.twilio.com/voice/api](https://www.twilio.com/voice/api)
- [https://www.twilio.com/api](https://www.twilio.com/api)  
2.	SDK Docs team will explain the purpose and goal of the API (we will iterate on the messaging as the endpoints are created).  
3.	As various OAuth flows are supported, SDK Docs describes who can use the API and the types of client software that can be created using the API.

##Get developers up to speed
1. We will get the developer’s up to speed.  Engineering will provide the ability to register a client application, provision an environment, etc.  SDK Docs will need to document whatever experience engineering enables.
2. SDK Docs can provide clarity around the structure of the API with <a href="{{ site.guide_constituents }}">logically grouped resources and operations</a>
3. SDK Docs and Engineering can provide ways for developers to learn the API through:
- <a href="{{ site.tutorials_getting_started }}" > Getting Started</a> and <a href="{{ site.tutorials_auth }}" >Web API Authorization</a> tutorials

<p class="alert alert-info">The technical references that appears within the APIM console will require documentation from the API Engineers for items such as endpoint , operations, URI parameters, response codes and application error codes (if applicable).</p> 

## Make things findable
1. SDK Docs will provide easy to use navigation to tutorials, developer guides, resources (Blog, FAQ, Q and A forums, code samples, etc), and developer portal. 
2. As the API endpoints are developed, the <a href="{{ site.guide_endpoints }}" >endpoints</a> will be organized and logically grouped. 

## Documentation and Technical Reference will be accurate, complete and up to date.
1. SDK Docs and Engineering will ensure the static site documentation is accurate, complete, and up to date.  
2. Any Engineer who creates API endpoints will need to document the endpoints for the <a href="{{ site.portal_endpoints }}" >technical reference<a> by providing detailed descriptions of the end point, parameters, response codes, and application error codes (if any).   
3. Engineering should collaborate with documentation on the creation of the developer guide.  
Examples:
- <a href="{{ site.guide_web_api_authorization }}" >Web API Authorization Guide</a>
- <a href="{{ site.guide_version }}">Version Strategy</a>
4. Engineering should provide <a href="{{ site.guide_endpoints }}" >Best Practices</a> to ensure we provide the best experience possible, and make integrations as efficient as possible

<p class="alert alert-info">Any Engineer who creates API endpoints will need to document the endpoints for the <a href="{{ site.portal_endpoints }}" >technical reference</a> </p>
<p class="alert alert-info">Engineering should contribute heavily to best practices.</p>

##Keep developers informed
1. When a new version of the API is released, it is very important to tell developers when you are:
- breaking their code
- adding features
- resolving issues
- notifying of issues within the release.  
2. Use a <a href="{{ site.resources_changelog }}" >Change Log</a> to keep up with what's been going on by enabling developers to see curated, chronologically ordered list of notable changes for each released (or version) of the API. Examples:
- [Stripe](https://stripe.com/docs/upgrades)
- [GitHub](https://developer.github.com/changes/) 
3. Use a  <a href="{{ site.resources }}" >blog</a> to communicate planed changes, unplanned changes, API outages, bugs, performance or other issues. 
4. Provide a <a href="{{ site.resources_status }}" >Status</a> application which notifies the developer with API related service issues such as performance degradation (Warning), service disruption (Alert).  Provide historical status pages.  Provide ability to subscribe to and RSS feed of the status page.  **Note**:  any future creation of a Status page would have to be prioritized in the backlog. 
5. Use <a href="{{ site.community_forum }}">Stack Overflow</a> as the technical forum. Seed the initial forum with questions and answers from early adoption partners, such as Zeidman Development.  The forum will require a community manager to ensure questions are answered in a timely fashion.  
6. Automated email notifications.  Developers who use the API actually want to be communicated with via email.  Small World Labs (SWL) provides group notification and subscription settings.  Members of the group can select to have instant, daily or weekly notifications sent to their email.
7.  Azure APIM generated  <a href="{{ site.portal_endpoints }}" >technical reference</a> and associated interactive console, code samples in multiple languages. 
<p class="alert alert-info">API Team engineers and QA should capture any <a href="{{ site.resources_changelog }}" >Change Log</a> related information against work items.  API team developers and testers should provide a plain English description of changes. We will need to develop a mechanism to capture and categorize information related to the <a href="{{ site.resources_changelog }}" >Change Log</a>.</p> 
<p class="alert alert-info">API Team engineers should create blog posts for issues as they arise.  Blogs and forums will need a community manager. </p> 
<p class="alert alert-info">API Team engineers would create status page:  such as UTC date time, issue details, root cause, and action to prevent future occurrences.  Additional details may be placed into a blog post and referenced from the status page, if necessary. </p> 
<p class="alert alert-info">API Team engineers should be responsible for answering questions on the forum.   </p> 

## Resources
This web site was inspired from industry best practice.  You are encouraged to review the following materials and API providers used to benchmark our developer website:

- [10 Reasons Developers Hate Your API (and what to do about it)](http://www.infoq.com/presentations/API-design-mistakes)
- [http://john-sheehan.com/blog/the-api-developer-experience-baseline](http://john-sheehan.com/blog/the-api-developer-experience-baseline)
- [http://developer.constantcontact.com/get-started.html](http://developer.constantcontact.com/get-started.html)
- [https://developer.spotify.com/web-api/](https://developer.spotify.com/web-api/)
- [https://developers.google.com/maps/web/](https://developers.google.com/maps/web/)
- [ https://stripe.com/]( https://stripe.com/)
- [https://developer.uber.com/](https://developer.uber.com/)

