---
layout: sidebar
priority: high
note: |  
  <p>TO DOs:</p> 
  <ul>
  <li>To Do Item 1</li>
  <li>To Do Item 2</li>
  <li>To Do Item 3</li>
  </ul>
---

<p class="alert alert-danger">Draft: This content is a work in progress.</p>

# Get Started with {{ stache.config.product_name_short }}#

This getting started tutorial provides some good template verbiage for your own tutorials.  It also teaches you some things about markdown, html, and handlebar expression usage within your content. 

** Example **

Ready to ABC with {{ stache.config.product_name_short }}? We've made it easy for you to get started in a matter of minutes. Our documentation provides the information and tools that you need to quickly accomplish greatness.  

This tutorial introduces our XYZ.  By successfully completing this tutorial, you will obtain the necessary knowledge to ABC.  

## Step 1 -  Schlitz narwhal ##

Plaid irony Austin Odd Future, listicle narwhal seitan meditation kitsch. Normcore post-ironic swag fashion axe. Asymmetrical quinoa sartorial, 90's butcher cliche meggings aesthetic master cleanse meh Pinterest. Godard ugh Neutra McSweeney's biodiesel, banjo vegan hella chambray Schlitz fingerstache pour-over readymade. Listicle McSweeney's +1, gluten-free bicycle rights Vice Shoreditch farm-to-table forage XOXO raw denim banjo typewriter before they sold out. Scenester YOLO cliche, slow-carb mlkshk ethical Odd Future health goth selfies PBR&B. 90's freegan occupy Wes Anderson four loko small batch, fap raw denim.

## Step 2 - High Life vegan ##
Jean shorts asymmetrical High Life vegan. Fingerstache stumptown Thundercats meditation, hoodie Williamsburg aesthetic scenester sartorial. Small batch blog retro, actually pug DIY YOLO swag occupy fixie four loko Echo Park whatever iPhone crucifix. Occupy cliche single-origin coffee fanny pack brunch, Truffaut cronut put a bird on it Pinterest. Hashtag slow-carb YOLO wolf blog. Biodiesel mustache street art tofu, whatever vegan fap. Wolf pop-up squid deep v 90's.

## Step 3 - Handlebar expression ##

Hey hipster, here's a sample link to the <a href="{{ stache.config.guide }}" >guide</a>.  The menu and navigation structure (including urls) are organized within stache.yml.   You will need to configure stache.yml to point to all your sweet content as you built out your website.  You can refer to the config data via handlebar expressions.  The example below refers to configuration data named `guide` within the site's stache.yml file.  

Example of an handlebar expression: `{{ stache.config.guide }}`

Example of content within the stach.yml file: `guide: <%= stache.config.base %>guide/`

## Step 4 - Images ##

Below is a cool placeholder for an 'ipsum image'. Scroll to the bottom of the markdown source to see how we do this.  This is called a reference-style links allow you to refer to your links by names, which you define elsewhere in your document:

So, this `![Ipsum Image][ipsum-image-00]`

produces this: 
![Ipsum Image][ipsum-image-00]

Here is another example of a reference-style link:  `![Your awesome][awesome-01]`

produces this:
![Your awesome][awesome-01]
and yes, you are awesome.  

BTW, your image files belong within the assets\img folder.

## Step 5 - Hipster emphasis ##
Markdown uses asterisks and underscores to indicate spans of emphasis.
```
Some of these words *are emphasized*.
Some of these words _are emphasized also_.

Use two asterisks for **strong emphasis**.
Or, if you prefer, __use two underscores instead__.
```
Etsy *iPhone bag*, hashtag paleo _small batch_ brunch. Kogi master cleanse **fingerstache** Marfa. Vegan Pitchfork tattooed hoodie __four loko__ photo booth, church-key wolf. Raw denim aesthetic brunch post-ironic, craft beer forage selvage four loko Wes Anderson tote bag pickled. Keffiyeh small batch tote bag, craft beer blog bespoke quinoa chia DIY pug. Migas tote bag meggings Schlitz DIY viral banh mi +1, cliche mixtape VHS leggings PBR. Brooklyn semiotics sriracha, food truck locavore slow-carb salvia sustainable pickled **Thundercats** lo-fi flexitarian selvage crucifix aesthetic.


##  Show'em the Resources ###

Once you have the reader up to speed with the getting started tuturial you should familiarize them with the rest of our documentation and support resources such as FAQ, blog, etc.

- Learn how to <a href="">Register your application</a> with our Web API. 
- Take a deeper dive into security and OAuth with our <a href="">Web API Authorization guide</a> and <a href="">tutorial</a>.
- Explore developer <a href="{{ stache.config.resources }}">resources</a> such as:
	- Blog
	- FAQ
	- Code samples


[ipsum-image-00]: http://placehold.it/800x300
[ipsum-image-01]: http://placehold.it/800x800
[ipsum-image-02]: http://placehold.it/800x200
[ipsum-image-03]: http://placehold.it/800x200

[ipsum-image-00A]: holder.js/800x300
[ipsum-image-01A]: holder.js/800x800
[ipsum-image-02A]: holder.js/800x200
[ipsum-image-03A]: holder.js/800x200/sky

[awesome-01]: /assets/img/whosawesome.jpg

