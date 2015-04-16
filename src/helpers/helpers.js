/**
* Stache Helpers
* Bobby Earl, 2015-02-12
*
* NOTES
*   - Overriding default markdown / md helpers for one simple reason.
*   - Nesting HTML generated text with four spaces.  Marked thinks this is code.
*   - In order to fix this, I override the rule that supports four spaces as code.
*   - The GFM (```) for code still works.
**/

/*jslint node: true, nomen: true, plusplus: true */
'use strict';

module.exports.register = function (Handlebars, options, params) {
  
  var merge = require('merge');
  var cheerio = require('cheerio');
  var fs = require('fs');

  // This is such a hack just to handle nested markdown blocks.
  var marked = require('marked');
  var renderer = new marked.Renderer();
  var lexer = new marked.Lexer();
  lexer.rules.code = /ANYTHING_BUT_FOUR_SPACES/;

  // Stores any custom counters
  var counts = {};

  /**
  * Utility function to get the basename
  **/
  function basename(path, clean) {

    // Clean is optional, but defaults to true
    if (arguments.length !== 2) {
      clean = true;
    }

    if (clean && path) {
      var dot = path.lastIndexOf('.')
      
      // Replace the extension
      path = dot === -1 ? path : path.substr(0, dot);
      
      // Replace the default page name
      path = path.replace('index', '');
      
      // Remove our build folder
      path = path.replace(params.assemble.options.stache.config.build, '');
      
      // Remove leading & trailing slash
      path = path.replace(/^\/|\/$/g, '');
      
    // Always return a path
    } else {
      path = '';
    }

    return path;
  }

  /**
  * Determines if two URI's are the same.
  * Supports thinking parent uri's are active
  **/
  function isActiveNav(dest, uri, parentCanBeActive) {
    dest = basename(dest);
    uri = basename(uri);
    var r = (parentCanBeActive && uri !== '') ? dest.indexOf(uri) > -1 : uri === dest;
    return r;
  }

  /**
  * Recursively searches the nav array to find the active link
  **/
  function getActiveNav(dest, nav_links, parentCanBeActive) {
    var j = nav_links.length,
      i = 0,
      r = '';

    for (i; i < j; i++) {

      if (isActiveNav(dest, nav_links[i].uri, parentCanBeActive)) {
        r = nav_links[i];
      } else if (nav_links[i].nav_links) {
        r = getActiveNav(dest, nav_links[i].nav_links, parentCanBeActive);
      }

      if (r !== '') {
        break;
      }
    }

    return r;
  }

  /**
  * Light wrapper for our custom markdown processor.
  **/
  function getMarked(md) {
    return marked.parser(lexer.lex(md || ''), {
      headerPrefix: '',
      renderer: renderer
    });
  }

  Handlebars.registerHelper({

    /**
    * Get an operation from data.operations.
    * @param {string} [property] - Returns a specific property of the operation.
    * @param {string} [name] - Search the list of operations on any property.
    * @example
    * {{# withOperation name="Address (Create)" }} {{ id }} {{/ withOperation }}
    * {{ getOperation name="Address (Create)" property="description" }}
    **/
    getOperation: function (context) {
      
      var operations = params.assemble.options.data.operations;
      if (!operations) {
        return '';
      }
      
      var hasProperty = context.hash.property !== 'undefined',
        filtered = operations.filter(function (item) {
          var prop;
          for (prop in context.hash) {
            if (context.hash.hasOwnProperty(prop) && prop !== 'property') {
              if (!item.hasOwnProperty(prop) || item[prop].indexOf(context.hash[prop]) === -1) {
                return false;
              }
            }
          }
          return true;
        });
      
      if (filtered.length === 1) {
        filtered = filtered[0];
      }
      
      if (hasProperty && typeof filtered[context.hash.property] !== 'undefined') {
        filtered = filtered[context.hash.property];
      }
      
      return filtered;
    },
    
    /**
    * Shortcut for this "{{ getOperation name='Address (Create)' property='id' }}"
    * AND, more importantly, it corrects the azure links.
    **/
    getOperationUri: function (context) {
      var operation = Handlebars.helpers.getOperation(context);
      if (operation) {
        return operation.id.replace('/apis/', 'docs/services/');
      }
    },

    /**
    * Presents a context with the results returned from getOperation
    * @param {array} [context.hash] - Optional key/value pairs to pass to @getOperation
    **/
    withOperation: function (context) {
      return context.fn(Handlebars.helpers.getOperation(context));
    },

    /**
    * Compares "uri" in the current context (or the first parameter) to the current URL
    * http://assemble.io/docs/FAQ.html
    **/
    isActiveNav: function (options) {
      var r = isActiveNav(options.hash.dest || this.dest || '', options.hash.uri || this.uri || '', options.hash.parentCanBeActive || true);
      return r ? options.fn(this) : options.inverse(this);
    },
    
    /**
    * Is the current page home
    **/
    isHome: function (options) {
      var b = basename(options.hash.dest || this.page.dest || 'NOT_HOME', true);
      return b === '' ? options.fn(this) : options.inverse(this);
    },

    /**
    * Debugging JSON content
    **/
    json: function (context) {
      return JSON.stringify(context);
    },

    /**
    * Does the current page have headings?
    **/
    hasHeadings: function(options) {
      return Handlebars.helpers.eachHeading(options) !== '' ? options.fn(this) : options.inverse(this);
    },

    /**
    * This innocuous looking helper took quite a long time to figure out.
    * It takes the current pages entire RAW source, crompiles it, and loads it in cheerio (jQuery).
    * Then it parses for the relevant headers and executes the template for each one.
    **/
    eachHeading: function (options) {
      var html = getMarked(Handlebars.compile(options.hash.page || '')(params.assemble.options)),
        r = '';

      cheerio(options.hash.selector || 'h2', html).each(function () {
        var el = cheerio(this);
        r = r + options.fn({
          name: el.text(),
          id: el.attr('id'),
          draft: el.parent().hasClass('draft')
        });
      });

      return r;
    },

    /**
    * Finds the current page in the nav and iterates its child links
    * Supports optional modulus parameters.
    **/
    eachChildLink: function (options) {
      var active = getActiveNav(options.hash.dest || this.page.dest || '', options.hash.nav_links || this.stache.config.nav_links || '', false);
      if (active && active.nav_links) {
        active = active.nav_links;
      }
      return Handlebars.helpers.eachWithMod(active, options);
    },

    /**
    * A supplement to the normal each.  Adds modulus parameters:
    *   - firstOrMod0
    *   - lastOrMod1
    **/
    eachWithMod: function (context, options) {
      var r = '',
        counter = 0,
        i = 0,
        m = 0,
        mod = options.hash.mod || 0,
        j;

      if (context && context.length) {
        j = context.length;
        for (i; i < j; i++) {
          if (context[i].showInNav) {
            m = counter % mod;
            context[i].first = counter === 0;
            context[i].last = counter === j - 1;
            context[i].mod0 = m === 0;
            context[i].mod1 = m === mod - 1;
            context[i].firstOrMod0 = context[i].first || context[i].mod0;
            context[i].lastOrMod1 = context[i].last || context[i].mod1;
            r += options.fn(context[i]);
            counter++;
          }
        }
      }
      return r;
    },

    /**
    * Loop through a certain number of times.
    **/
    loop: function (options) {
      var arr = new Array(options.hash.end);
      return Handlebars.helpers.each(arr, options);
    },

    /**
    * Overriding default markdown helper.
    * See notes above for more information.
    **/
    markdown: function (options) {
      return getMarked(options.fn(this));
    },

    /**
    * If settings say to render, wrap content in div
    **/
    draft: function (options) {
      return params.assemble.options.stache.config.draft ? ('<div class="draft">\r\n\r\n' + getMarked(options.fn(this)) + '\r\n\r\n</div>') : '';
    },

    /**
    * Return the current count for the required property
    **/
    count: function(prop) {
      if (typeof counts[prop] === 'undefined') {
        counts[prop] = 0;
      }
      return counts[prop];
    },

    /**
    * Increment the count for the required property
    **/
    increment: function(prop) {
      counts[prop] = typeof counts[prop] === 'undefined' ? 0 : (counts[prop] + 1);
    },    

    /**
    * Render a file.  Search path order: partial, absolute, relative, content folder
    **/
    include: function (file, context, options) {
      
      if (typeof options === 'undefined') {
        options = context;
        context = this;
      }
      
      var r = '';
      var template = '';
      var fileWithPath = file;
      var c = merge(context, options.hash);
      
      if (typeof Handlebars.partials[fileWithPath] !== 'undefined') {
        template = Handlebars.partials[fileWithPath]; 
      } else {
      
        if (!fs.existsSync(fileWithPath)) {
          fileWithPath = this.page.src.substr(0, this.page.src.lastIndexOf('/')) + '/' + file;
          if (!fs.existsSync(fileWithPath)) {
            fileWithPath = params.assemble.options.stache.config.content + file;
            if (!fs.existsSync(fileWithPath)) {
              fileWithPath = '';
            }
          }
        }

        if (fileWithPath !== '') {
          template = fs.readFileSync(fileWithPath).toString('utf8');
        }
        
      }
      
      if (typeof template === 'string') {
        r = Handlebars.compile(template)(c);
      }
      
      // I spent an entire day tracking down this bug.
      // Files created on different systems with different line endings freaked this out.
      return new Handlebars.SafeString(r.replace(/\r\n/g, '\n'));
    },

    /**
    * Supports object + arrays
    **/
    length: function (collection) {
      if( collection && collection.length ) return collection.length;
      var length = 0;
      for( var prop in collection ){
          if( collection.hasOwnProperty( prop ) ){
              length++;
          }
      }
      return length;
    },
    
    withCoverage: function (collection, options) {
      var r = '';
      if (arguments.length > 1) {
        var total = 0;
        var coverage = 0;
        var percentage = 0;
        var cssClass = 'success';

        for (var prop in collection){
          if (collection.hasOwnProperty(prop)) {
            total += collection[prop].length ? collection[prop].length : 1;
            if (collection[prop].length) {
              for (var m = 0, n = collection[prop].length; m < n; m++) {
                coverage += collection[prop][m] === 0 ? 0 : 1;
              }
            } else if (collection[prop] !== 0) {
              coverage++;
            }
          }
        }
        
        percentage = total === 0 ? 100 : ((coverage / total) * 100);
        if (percentage < 50) {
          cssClass = 'danger';
        } else if (percentage < 80) {
          cssClass = 'warning';
        }
        
        r = options.fn({
          total: total,
          coverage: coverage,
          cssClass: cssClass,
          percentage: percentage === 100 ? 100 : percentage.toFixed(options.hash.fixed)
        });
      }

      return r;
    }
  
  });
};
