---
# When/if we ditch github.io, we can use a plugin to "liquify" the yaml variables before displaying them.
# http://stackoverflow.com/questions/14487110/include-jekyll-liquid-template-data-in-a-yaml-variable
---

# Frequently Asked Questions

<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">

<!-- QUESTION 1 -->
{% capture question %}
  So, how do you sign your requests?
{% endcapture %}

<!-- ANSWER 1 -->
{% capture answer %}
  You need to provide a token obtained using OAuth 2. Check <a href="{{ '/guide/#web-api-authorization' | prepend: site.baseurl }}" target="_blank">Web API Authorization within our Developer Guide</a> for more information.
{% endcapture %}

<!-- INCLUDE 1 -->
{% include faq.html index=1 question=question answer=answer %}



<!-- QUESTION 2 -->
{% capture question %}
  How do I sign up for the API?
{% endcapture %}

<!-- ANSWER 2 -->
{% capture answer %}
  IPhone banh mi crucifix taxidermy Shoreditch fingerstache. Kickstarter mlkshk literally, flexitarian kitsch Bushwick polaroid Thundercats squid wolf fanny pack distillery. DIY Echo Park you probably haven't heard of them master cleanse. Pickled you probably haven't heard of them heirloom, kale chips selfies freegan brunch Helvetica 3 wolf moon pour-over Blue Bottle vegan. Bespoke chia Echo Park roof party, mixtape normcore cold-pressed Blue Bottle before they sold out pour-over whatever. Ethical raw denim American Apparel drinking vinegar mustache mixtape. Four loko migas raw denim asymmetrical McSweeney's pickled, Echo Park scenester cred dreamcatcher.
{% endcapture %}

<!-- INCLUDE 2 -->
{% include faq.html index=2 question=question answer=answer %}



<!-- QUESTION 3 -->
{% capture question %}
   I need help, where can I get support?
{% endcapture %}

<!-- ANSWER 3 -->
{% capture answer %}
Fingerstache selvage occupy butcher, heirloom trust fund XOXO. Paleo banh mi mlkshk Godard hashtag Blue Bottle wayfarers tousled. Banh mi narwhal McSweeney's biodiesel, fixie locavore DIY squid banjo Thundercats fap. Photo booth direct trade selvage chambray, cliche organic keytar migas. Flexitarian fanny pack Odd Future dreamcatcher crucifix, VHS trust fund fixie lomo tilde kale chips messenger bag squid taxidermy ennui. Butcher health goth gluten-free, lumbersexual Kickstarter kogi stumptown semiotics. Wes Anderson post-ironic bicycle rights, aesthetic direct trade jean shorts +1 typewriter master cleanse bitters church-key hoodie listicle banh mi chambray.

Fingerstache vinyl meh biodiesel, before they sold out four dollar toast chambray keytar Pitchfork bicycle rights. Tilde pop-up PBR&B, small batch 8-bit lo-fi sartorial VHS readymade craft beer meggings Brooklyn keffiyeh. Portland bespoke mixtape, fixie keffiyeh pug kitsch. Vegan beard vinyl, hashtag cold-pressed whatever cred American Apparel kogi. Actually fixie Banksy cornhole normcore lumbersexual. Artisan Kickstarter letterpress cardigan pug. Roof party salvia direct trade skateboard, occupy Echo Park small batch mixtape locavore.
{% endcapture %}

<!-- INCLUDE 3 -->
{% include faq.html index=3 question=question answer=answer %}



<!-- QUESTION 4 -->
{% capture question %}
  Can I call your API using JavaScript?
{% endcapture %}

<!-- ANSWER 4 -->
{% capture answer %}
  Austin disrupt gentrify polaroid, YOLO sustainable actually cred. +1 cred vinyl, literally freegan deep v viral lomo artisan gluten-free. Ennui Godard paleo gluten-free kogi Austin. Williamsburg plaid polaroid locavore, biodiesel kogi bespoke Kickstarter fanny pack leggings semiotics mumblecore meditation. Dreamcatcher sriracha Neutra, distillery tattooed jean shorts plaid yr chillwave listicle lumbersexual gluten-free Kickstarter normcore mumblecore. Asymmetrical keffiyeh wolf fixie, freegan chambray fanny pack Odd Future cold-pressed deep v. Sartorial street art cred ugh VHS.
{% endcapture %}

<!-- INCLUDE 4 -->
{% include faq.html index=4 question=question answer=answer %}



<!-- QUESTION 5 -->
{% capture question %}
  What uses limits apply to the {{ site.productname }} API?
{% endcapture %}

<!-- ANSWER 5 -->
{% capture answer %}
  Post-ironic asymmetrical gluten-free, Godard actually Odd Future occupy 8-bit cornhole. Stumptown bicycle rights synth street art, forage yr Tumblr. Typewriter Neutra kogi, scenester occupy selfies dreamcatcher fanny pack cronut crucifix Carles irony gastropub iPhone. PBR&B Godard Pinterest next level fixie raw denim. Sustainable selfies keytar banjo, DIY hashtag beard tattooed. Bushwick food truck quinoa art party single-origin coffee shabby chic. Listicle skateboard gluten-free single-origin coffee cardigan farm-to-table paleo, Shoreditch kogi migas PBR&B bitters.
{% endcapture %}

<!-- INCLUDE 5 -->
{% include faq.html index=5 question=question answer=answer %}

</div>