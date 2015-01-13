---
showComments: true
showFeedback: true
---

# Introduction #
The RE NXT REST API is designed to help you unlock your key RE NXT data allowing developers to create web applications that manage constituents, addresses, email addresses, attributes....  Since the API is based on REST principles, it's very easy to write and test applications. You can use your browser to access URLs, and you can use pretty much any HTTP client in any programming language to interact with the API.


> TO DO  Complete Intro Paragraph

## Easy to learn

We have provided numerous developer resources to help you integrate with RE NXT.  This developer web site (developer.blackbaud.com/renxt) orients you to the various 
developer resources and tools:

tutorials, developer guide, technical reference, interactive API console, forum, and code samples.  

### Tutorials

Our getting started and authentication tutorials gets you up to speed fast.  These will guide you through the process of signing up for an API key, trying out our API console, and negotiating our security.    You will be writing code against our API in no time.  

### Technical Reference and interactive API Console
We've made our API as explorable as possible.  Use our developer portal to [sign up] for an API key and start exploring our API right way.  The developer portal contains a technical reference and interactive API Console that let's you learn the api through hands on interaction.

## Support

### Blogs and Forum
Our blogs help keep up to date with API changes, issues, and developer tips. Our Q and A forum enables you to ask a question about the API and receive an answer. To learn more including how to subscribe, see Community.     

> TO DO  need community directory and index.md.  Need to link to that page once created.

# API Version

When we change the API in a backwards-incompatible way, we release a new  version.

*(Below represents some test verbiage for versioning and does not necessarily reflect the final versioning strategy)*

For the RE NXT API, the URL has a major version number (v1), but the API has date based sub-versions which can be chosen using a custom HTTP request header. In this case, the major version provides structural stability of the API as a whole while the dated versions account for smaller changes (field deprecation, endpoint changes, etc). 

## What changes does Blackbaud consider to be “backwards-compatible”? ##

- Adding new API resources.
- Adding new optional request parameters to existing API methods.
- Adding new properties to existing API responses.
- Changing the order of properties in existing API responses.
- Changing the length or format of object IDs or other opaque strings. This includes adding or removing fixed prefixes. 
- You can safely assume IDs we generate will never exceed x characters, but you should be able to handle IDs of up to that length. If for example you’re using MySQL, you should store IDs in a VARCHAR(x) COLLATE utf8_bin column (the COLLATE configuration ensures case-sensitivity in lookups).

## API changelog ##
The changelog reflects backwards-incompatible updates, backward compatible updates, removed features due to planned deprecation, features marked for future planned deprecation, and fixes for bugs or known issues. Make sure you’re subscribed to our blog and API mailing list to keep up with API changes.


[sign up]: https://bbbobbyearl.portal.azure-api.net/