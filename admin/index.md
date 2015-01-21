---
layout: default
showHeadings: false
showFeedback: true
---

# Admin - Content Instructions

I quickly created this page as a refresher on how to build content in the site.

0. Create a new folder, for example create a new folder called `hello-world` inside the `tutorials` folder.
0. Inside your new `hello-world` folder, create an `index.md` file.
0. Open your new `index.md` file.
0. At the very top of your file, open your front-matter section by typing three dashes `---`.
0. On a new line, enter `layout: my-layout` replacing my-layout with one from the table below.  Also below is a list of front-matter variables you can define.
0. On a new line, close the front-matter section by again typing the three dashes `---`.

<p class="alert alert-info">As an example, on this page I'm using the `default` layout, but I've set `showHeadings: false` and `showFeedback: true`.</p>

Unfortunately, front-matter variables aren't inherited exactly as I feel like they should be as pointed out by the <a href="https://github.com/jekyll/jekyll/issues/3307" target="_blank">following GitHub Issue</a>.  Basically, once a layout sets a variable, it's impossible for a page to change it.  For example, since the `content` layout sets `showComments` and `showFeedback` to true, it would be impossible to use that layout without having both of those included.  Let's say you only want the feedback section, then you change to the `default` layout and set `showFeedback` to true, which is exactly what I've done on this page.

## Layouts

<table class="table table-bordered">
  <tr>
    <th>Layout</th>
    <th>Description</th>
    <th>showComments</th>
    <th>showFeedback</th>
  </tr>
  <tr>
    <td>base</td>
    <td>Contains the HTML Doctype, CSS + JS files, and footer.</td>
    <td>NA</td>
    <td>NA</td>
  </tr>
  <tr>
    <td>default</td>
    <td>Extends the base layout by adding header and sidebar navigation.</td>
    <td>false</td>
    <td>false</td>
  </tr>
  <tr>
    <td>content</td>
    <td>Extends the default layout by enabling comments and feedback.  This is the ideal layout for most generic content on the site.</td>
    <td>true</td>
    <td>true</td>
  </tr>
  <tr>
    <td>blank</td>
    <td>Completely blank layout.  Best used for different content-types, ie, XML, CSS, or JS.</td>
    <td>NA</td>
    <td>NA</td>
  </tr>
</table>

## Front Matter Options

<table class="table table-bordered">
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Default Value (In _config.yml)</th>
  </tr>
  <tr>
    <td>showComments</td>
    <td>Enables comments in the footer by adding the disqus div and scripts. This feature is implemented in the default layout, which means you must at least use the default layout or a layout that extends the default layout.</td>
    <td>false</td>
  </tr>
  <tr>
    <td>showFeedback</td>
    <td>Enable the refer to GitHub content in the footer.  This feature is implemented in the default layout, which means you must at least use the default layout or a layout that extends the default layout.</td>
    <td>false</td>
  </tr>
  <tr>
    <td>showSidebar</td>
    <td>When true, will attempt to show the relevant sibling links in _config.yml in the sidebar.</td>
    <td>true</td>
  </tr>
  <tr>
    <td>showHeadings</td>
    <td>When true, the sidebar nav menu is automatically generated based on the current pages H2's.</td>
    <td>true</td>
  </tr>
  <tr>
    <td>note</td>
    <td>When specified, a global <i class="fa fa-info"></i> icon is display in the bottom right of the page, with this message being displayed as a modal when the icon is clicked.</td>
    <td></td>
  </tr>
  <tr>
    <td>priority</td>
    <td>Requires the note variable to be set.  Can be one of: high, medium, or low.</td>
    <td></td>
  </tr>
</table>

## Content Notes

Very similar to the page note which is specified in the front matter, the following snippet can be used to include inline notes.

`{% raw %}{% include note.html priority='medium' note='Medium priority note.' %}{% endraw %}`

## Adding Links to _config.yml
  
- showInHeader: Useful for showing menu items only in the footer. (default: true)
- openNewWindow: Sets a links target to "_blank," which means it will open in a new window/tab. (default: false)

## Equal Height Divs

In many cases, for example on the [tutorials landing page][tutorials] and the [code samples page][code], we found the need for equal height divs.  If you find yourself in that situation, simply add the `equal-height` class to any number of divs.  JavaScript will automatically run on the page looking for that class and adjust the divs so that they all have the same height.

[tutorials]: {{ '/tutorials/' | prepend: site.baseurl }}
[code]: {{ '/resources/code/' | prepend: site.baseurl }}

## Styling Azure

Although Azure's API Management Suite provides access to the Bootstrap LESS variables, I chose to make all modifications through CSS overrides.  This was purposefully done in an effort to make replicating the steps as efficient as possible.

<ol>
  <li>In Azure API Management, click Widgets link.</li>
  <li>Click Header widget in Header placeholder.</li>
  <li>
    Rename title to Custom CSS, copy/paste the following, and click save:
    {% gist bbBobbyEarl/e686e88158ac2a43895d custom-css.html %}
  </li>

  <li>Click Footer widget in Footer placeholder.</li>
  <li>Copy/paste the following into the Body (HTML) and click save:
<textarea class="form-control" rows="8">
<div class="footer-site">
    <div class="row">
      <div class="col-xs-6 col-sm-4">
        <p>
          <a href="/developer.blackbaud.com-renxt">
            <span class="bbsky-char bbsky-char-re"></span>
            <span class="bbsky-char bbsky-char-nxt"></span>
          </a>
        </p>
        <ul class="list-unstyled">

            <li>
              <a href="http://blackbaud-community.github.io/developer.blackbaud.com-renxt/">Home</a>
            </li>

            <li>
              <a href="http://blackbaud-community.github.io/developer.blackbaud.com-renxt/tutorials/">Tutorials</a>
            </li>

            <li>
              <a href="http://blackbaud-community.github.io/developer.blackbaud.com-renxt/guide/">Developer Guide</a>
            </li>

            <li>
              <a href="http://blackbaud-community.github.io/developer.blackbaud.com-renxt/resources/">Resources</a>
            </li>

            <li>
              <a href="https://bbbobbyearl.portal.azure-api.net/">Portal</a>
            </li>

            <li>
              <a href="http://blackbaud-community.github.io/developer.blackbaud.com-renxt/legal/">Legal</a>
            </li>

        </ul>  <!-- .list-unstyled -->            
      </div>  <!-- .col-sm-4 -->
      <div class="col-xs-6 col-sm-4">
        &nbsp;
      </div>  <!-- .col-sm-4 -->
      <div class="col-sm-4">
        <div class="row">
          <div class="col-sm-12">

            <ul class="list-inline bb-love">
              <li>
                <a href="http://www.blackbaud.com" target="_blank">
                  <img src="//blackbaud-community.github.io/developer.blackbaud.com-renxt/assets/img/logo-bb-white.png" alt="Blackbaud" class="img-responsive" />
                </a>
              </li>
              <li>
                <i class="fa fa-lg fa-plus"></i>
              </li>
              <li>
                <a href="http://www.github.com/blackbaud-community" target="_blank">
                  <img src="//blackbaud-community.github.io/developer.blackbaud.com-renxt/assets/img/logo-github.png" alt="GitHub" class="img-responsive" />
                </a>
              </li>
            </ul>  <!-- .list-inline -->

          </div>  <!-- .col-sm-12 -->
        </div>  <!-- .row -->
        <div class="row">
          <div class="col-sm-12">

            <ul class="list-inline social-icons">
              <li>
                <a href="https://github.com/blackbaud-community" target="_blank">
                  <i class="fa fa-github"></i>
                </a>
              </li>
              <li>
                <a href="https://plus.google.com/113382459921828617974" target="_blank">
                  <i class="fa fa-google-plus"></i>
                </a>
              </li>
              <li>
                <a href="http://twitter.com/blackbaud" target="_blank">
                  <i class="fa fa-twitter"></i>
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/blackbaud" target="_blank">
                  <i class="fa fa-facebook"></i>
                </a>
              </li>
              <li>
                <a href="http://www.youtube.com/user/blackbaudinc" target="_blank">
                  <i class="fa fa-youtube"></i>
                </a>
              </li>
            </ul>  <!-- .list-inline -->

          </div>  <!-- .col-sm-12 -->
        </div>  <!-- .row -->
      </div>  <!-- .col-sm-4 -->
    </div>  <!-- .row -->
</div>  <!-- .footer-site -->
</textarea>
  </li>
  <li>Click Add in the Footer placeholder.</li>
  <li>Click Html Widget</li>
  <li>Give the widget a title of Custom JS and uncheck the render checkbox.</li>
  <li>Set the Position to 2.</li>
  <li>Copy/paste the following into the Body(HTML) and click save:
<textarea class="form-control" rows="8">
<div id="omnibar"></div>

<script src="//cdnjs.cloudflare.com/ajax/libs/easyXDM/2.4.17.1/easyXDM.min.js"></script>
<script src="//signin.blackbaud.com/omnibar.js"></script> 
<script src="//blackbaud-community.github.io/developer.blackbaud.com-renxt/assets/js/holder.js"></script>
<script>
;(function($, window, document, undefined) {
  
  $(function() {
    $('body').addClass('bb-omnibar-height-padding'); 
    $('#navigation .navbar-nav > li:eq(4)').addClass('active');
    $('.zone-aside-first .navbar-nav').insertBefore($('.zone-aside-first .nav-pills'));
    $('head').append('<link rel="icon" href="//blackbaud-community.github.io/developer.blackbaud.com-renxt/assets/img/favicon.ico" type="image/ico">');
  });
  
  BBAUTH.Omnibar.load(document.getElementById("omnibar"), {
    serviceName: 'RENXT Developer',
    signInRedirectUrl: document.location.href,
    signOutRedirectUrl: ''
  });
  
})(jQuery, window, document);
</script>
</textarea>
  </li>
</ol>