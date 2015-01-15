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

## Adding Blog Category

0. Create a folder under blog with the name of your category.
0. Create a folder under that new folder called _posts.
0. Create your blog posts in that new _posts folder.