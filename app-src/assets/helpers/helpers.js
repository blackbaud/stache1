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

    if (arguments.length !== 2) {
      clean = true;
    }

    if (clean && path) {
      var dot = path.lastIndexOf('.'),
        toReplace = [
          {
            replace: params.assemble.options.site.base,
            replaceWith: ''
          },
          {
            replace: params.assemble.options.site.app_build,
            replaceWith: ''
          },
          {
            replace: 'index',
            replaceWith: ''
          }
        ],
        i = 0,
        j = toReplace.length;

      path = dot === -1 ? path : path.substr(0, dot);
      for (i; i < j; i++) {
        path = path.replace(toReplace[i].replace, toReplace[i].replaceWith);
      }
    } else {
      path = '';
    }

    return path;
  }

  function isActiveNav(dest, uri) {
    dest = basename(dest);
    uri = basename(uri);
    return uri !== '' ? dest.indexOf(uri) > -1 : uri === dest;
  }

  /**
  * Recursively searches the nav array to find the active link
  **/
  function getActiveNav(dest, links) {
    var j = links.length,
      i = 0,
      r = '';

    for (i; i < j; i++) {

      if (isActiveNav(dest, links[i].uri)) {
        r = links[i];
      } else if (links[i].links) {
        r = getActiveNav(dest, links[i].links);
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
    return marked.parser(lexer.lex(md), {
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
      
      var hasProperty = context.hash.property !== 'undefined',
        filtered = params.assemble.options.data.operations.filter(function (item) {
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
      return isActiveNav(options.hash.dest || this.dest || '', options.hash.uri || this.uri || '') ? options.fn(this) : options.inverse(this);
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
    * It takes the current pages entire RAW source, compiles it, and loads it in cheerio (jQuery).
    * Then it parses for the relevant headers and executes the template for each one.
    **/
    eachHeading: function (options) {

      var html = getMarked(Handlebars.compile(options.hash.page || this.pagination.index.page)(params.assemble.options)),
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
      var active = getActiveNav(options.hash.dest || this.page.dest || '', options.hash.links || this.site.links || '');
      if (active && active.links) {
        active = active.links;
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
        i = 0,
        m = 0,
        mod = options.hash.mod || 0,
        j;

      if (context && context.length) {
        j = context.length;
        for (i; i < j; i++) {
          m = i % mod;
          context[i].first = i === 0;
          context[i].last = i === j - 1;
          context[i].mod0 = m === 0;
          context[i].mod1 = m === mod - 1;
          context[i].firstOrMod0 = context[i].first || context[i].mod0;
          context[i].lastOrMod1 = context[i].last || context[i].mod1;
          r += options.fn(context[i]);
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
    * Includes a relative file
    **/
    include: function (file, options) {
      return fs.readFileSync(this.page.src.substr(0, this.page.src.lastIndexOf('/')) + '/' + file);
    },

    /**
    * Overriding default markdown helper.
    * See notes above for more information.
    **/
    markdown: function (options) {
      return getMarked(options.fn(this));
    },

    draft: function (options) {
      /*
      var m = marked(options.fn(this), {
        renderer: renderer
      });
      return params.assemble.options.draft ? ('<div class="draft">' + m + '</div>') : '';
      */
      return '<div class="draft">\r\n\r\n' + getMarked(options.fn(this)) + '\r\n\r\n</div>';
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
    }
  
  });
};
