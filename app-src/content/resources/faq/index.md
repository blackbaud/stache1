---
layout: sidebar
---

# Frequently Asked Questions

### How do I get started with the API?

The <a href="{{ site.tutorials_getting_started }}" target="_blank">Get Started with the RE NXT API</a> tutorial is the best place to get you up and running quickly.

### So, how do you sign your requests?  How do I pass security credentials from my client application to the API?

You need to provide a token obtained using OAuth 2. Check <a href="{{ site.guide_web_api_authorization }}" target="_blank">Web API Authorization</a> for more information.

### What authorization flow should I use for an app running in a browser?

Browser-based apps run entirely in the browser after loading the source code from a web page. Since the entire source code is available to the browser, they cannot maintain the confidentiality of their <b>client secret key</b>, so the secret is not used in this case.  

Like browser-based apps, mobile apps also cannot maintain the confidentiality of their <b>client secret key</b>. Because of this, mobile apps must also use an OAuth flow that does not require a client secret.

For both browser based apps and mobile apps, the Implicit OAuth2 grant type should be used for this use case.
See <a href="{{ site.guide_web_api_authorization }}" target="_blank">Web API Authorization</a> for the various OAuth2 grant types we support.

### I need help, where can I get support?

Within our <a href="{{ site.resources }}" target="_blank">Resources</a> your will find the link to our Forum. The forum allows you the opportunity to ask, answer, vote and review questions.

### How do I get my <b>client id</b>  and <b>client secret</b> for my app?

As the first step towards authorization, you will need to <a href="{{ site.guide_registering_your_app }}" target="_blank">register your application</a>. That will give you a unique <b>client id</b> and <b>client secret key</b> to use in the authorization flows.

The <b>client id</b> is used within various OAuth 2.0 authorization flows.  The <b>client secret key</b> is used within the Authorization Code and Client Credentials flows.  Remember, the secret must be exchanged from the server side of your client application. If the secret is compromised you can regenerate the key. 
{% endcapture %}

### Oops, my client secret has been compromized, how do I regenerate my client secret?

See Regenerating the Client Secret?

{{# draft }}
### Do you support cross-origin resource sharing to allow you to interact securely with our API from a client-side web application?

TBD
{{/ draft }}