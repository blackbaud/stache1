---
faq: 
  - question: How do I signup for the API?
    answer: IPhone banh mi crucifix taxidermy Shoreditch fingerstache. Kickstarter mlkshk literally, flexitarian kitsch Bushwick polaroid Thundercats squid wolf fanny pack distillery. DIY Echo Park you probably haven't heard of them master cleanse. Pickled you probably haven't heard of them heirloom, kale chips selfies freegan brunch Helvetica 3 wolf moon pour-over Blue Bottle vegan. Bespoke chia Echo Park roof party, mixtape normcore cold-pressed Blue Bottle before they sold out pour-over whatever. Ethical raw denim American Apparel drinking vinegar mustache mixtape. Four loko migas raw denim asymmetrical McSweeney's pickled, Echo Park scenester cred dreamcatcher.
    
  - question: I need help, where can I get support?
    answer: |
      Fingerstache selvage occupy butcher, heirloom trust fund XOXO. Paleo banh mi mlkshk Godard hashtag Blue Bottle wayfarers tousled. Banh mi narwhal McSweeney's biodiesel, fixie locavore DIY squid banjo Thundercats fap. Photo booth direct trade selvage chambray, cliche organic keytar migas. Flexitarian fanny pack Odd Future dreamcatcher crucifix, VHS trust fund fixie lomo tilde kale chips messenger bag squid taxidermy ennui. Butcher health goth gluten-free, lumbersexual Kickstarter kogi stumptown semiotics. Wes Anderson post-ironic bicycle rights, aesthetic direct trade jean shorts +1 typewriter master cleanse bitters church-key hoodie listicle banh mi chambray.

      Fingerstache vinyl meh biodiesel, before they sold out four dollar toast chambray keytar Pitchfork bicycle rights. Tilde pop-up PBR&B, small batch 8-bit lo-fi sartorial VHS readymade craft beer meggings Brooklyn keffiyeh. Portland bespoke mixtape, fixie keffiyeh pug kitsch. Vegan beard vinyl, hashtag cold-pressed whatever cred American Apparel kogi. Actually fixie Banksy cornhole normcore lumbersexual. Artisan Kickstarter letterpress cardigan pug. Roof party salvia direct trade skateboard, occupy Echo Park small batch mixtape locavore.
    
  - question: Can I call your API using JavaScript?
    answer: Austin disrupt gentrify polaroid, YOLO sustainable actually cred. +1 cred vinyl, literally freegan deep v viral lomo artisan gluten-free. Ennui Godard paleo gluten-free kogi Austin. Williamsburg plaid polaroid locavore, biodiesel kogi bespoke Kickstarter fanny pack leggings semiotics mumblecore meditation. Dreamcatcher sriracha Neutra, distillery tattooed jean shorts plaid yr chillwave listicle lumbersexual gluten-free Kickstarter normcore mumblecore. Asymmetrical keffiyeh wolf fixie, freegan chambray fanny pack Odd Future cold-pressed deep v. Sartorial street art cred ugh VHS.
    
  - question: What uses limits apply to the {{ site.productname }} API?
    answer: Post-ironic asymmetrical gluten-free, Godard actually Odd Future occupy 8-bit cornhole. Stumptown bicycle rights synth street art, forage yr Tumblr. Typewriter Neutra kogi, scenester occupy selfies dreamcatcher fanny pack cronut crucifix Carles irony gastropub iPhone. PBR&B Godard Pinterest next level fixie raw denim. Sustainable selfies keytar banjo, DIY hashtag beard tattooed. Bushwick food truck quinoa art party single-origin coffee shabby chic. Listicle skateboard gluten-free single-origin coffee cardigan farm-to-table paleo, Shoreditch kogi migas PBR&B bitters.
---

# Frequently Asked Questions

<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">

  {% for item in page.faq %}
    <div class="panel panel-default">
      <div class="panel-heading" role="tab" id="heading-{{ forloop.index }}">
        <h4 class="panel-title">
          <a data-toggle="collapse" data-parent="#accordion" href="#collapse-{{ forloop.index }}"  aria-expanded="{% if forloop.first %}true{% else %}false{% endif %}" aria-controls="collapse-{{ forloop.index }}">
            {{ forloop.index }}. {{ item.question }}
          </a>
        </h4>
      </div>
      <div id="collapse-{{ forloop.index }}" class="panel-collapse collapse {% if forloop.first %}in{% endif %}" role="tabpanel" aria-labelledby="heading-{{ forloop.index }}">
        <div class="panel-body">
          {{ item.answer }}
        </div>
      </div>
    </div>
  {% endfor %}

</div>