/**
* Stache Helpers
* Bobby Earl, 2015-02-12
*
* NOTES
**/

/*jslint node: true, nomen: true, plusplus: true */
'use strict';

var cheerio = require('cheerio');
var fs = require('fs');

module.exports.register = function (Handlebars, options, params) {
  
  /**
  * Utility function to get the basename
  **/
  function basename(path, toReplace) {

    if (arguments.length !== 2) {
      return '';
    }

    var dot = path.lastIndexOf('.'),
      i = 0,
      j = toReplace.length;

    path = dot === -1 ? path : path.substr(0, dot);

    for (i; i < j; i++) {
      path = path.replace(toReplace[i].replace, toReplace[i].replaceWith);
    }

    return path;
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
    * Accounts for basename helper returning source folder.
    * http://assemble.io/docs/FAQ.html
    **/
    isActiveNav: function (page, uri, context) {
      var toReplace = [
          {
            replace: params.assemble.options.data.nav.base,
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
        basePage = basename(page, toReplace),
        baseUri = basename(uri, toReplace),
        r = baseUri !== '' ? basePage.indexOf(baseUri) > -1 : baseUri === basePage;

      return r ? context.fn(this) : context.inverse(this);
    },

    /**
    * Debugging JSON content
    **/
    json: function (context) {
      return JSON.stringify(context);
    },

    /**
    * This innocuous looking helper took quite a long time to figure out.
    * It takes the current pages entire RAW source, compiles it, and loads it in cheerio (jQuery).
    * Then it parses for the relevant headers and executes the template for each one.
    **/
    eachHeading: function (context, options) {
      var r = '';
      cheerio(options.hash.selector || 'h2', Handlebars.compile(context)(this)).each(function () {
        var el = cheerio(this);
        r = r + options.fn({
          text: el.text(),
          id: el.attr('id')
        });
      });


      return r;
    },

    /**
    * Includes a relative file
    **/
    include: function (file, options) {
      return fs.readFileSync(this.page.src.substr(0, this.page.src.lastIndexOf('/')) + '/' + file);
    }
  
  });
};
