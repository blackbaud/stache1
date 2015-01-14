RENXT Developer
=============================

Follow the steps to setup jekyll from https://help.github.com/articles/using-jekyll-with-pages#installing-jekyll.

The config file structure is slightly more complicated than a normal jekyll project - the reason being is we're attempting to support three build environments.  One of the major differences between these three environments is the <code>baseurl</code> necessary to function properly.

### Building for GitHub Pages

There is no work to be done for this environment.  Their build automatically looks at the _config.yml file.

### Building for Development Environment

<code>jekyll serve --baseurl ''</code>

You will now be able to visit <a href="http://localhost:4000">http://localhost:4000</a> in your browser to view the site.  You should also notice that the site is being stored and served from the _site directory.  This directory is set to be ignored.

### Building for the Production Environment

<code>jekyll build --baseurl 'renxt'</code>

### Contributing 

If you would like to contribute to this code sample, please carefully read the [contributing documentation](https://github.com/blackbaud-community/Blackbaud-CRM/blob/master/CONTRIBUTING.md), which details the necessary workflow.  Included in those requirements is [signing the Contributor License Agreement](http://developer.blackbaud.com/cla).

### Oh Hey, BTW

If you're a passionate and knowledgable developer who enjoys working on challenging projects and equally cares about giving back to non-profits, consider joining the Blackbaud Team.  

https://www.blackbaud.com/careers
