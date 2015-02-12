/**
* Stache Helpers
* Bobby Earl, 2015-02-12
*
* NOTES
**/

/*jslint node: true, nomen: true, plusplus: true */
'use strict';

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
    }
  
  });
};
