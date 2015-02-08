module.exports.register = function(Handlebars, options, params) {
  
  Handlebars.registerHelper({
  
    getNav: function(key) {
      return 'BOBBY';
    },
    
    /**
    * Get an operation from data.operations.
    * @param {string} [property] - Returns a specific property of the operation.
    * @param {string} [name] - Search the list of operations on any property.
    **/
    getOperation: function(context) {
      
      var hasProperty = context.hash.property !== 'undefined',
          filtered = params.assemble.options.data.operations.filter(function(item) {
            for (var prop in context.hash) {
              if (prop !== 'property') {
                if (!(prop in item) || item[prop].indexOf(context.hash[prop]) === -1) {
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
    * Presents a context with the results returned from getOperation
    * @param {array} [context.hash] - Optional key/value pairs to pass to @getOperation
    **/
    withOperation: function(context) {
      return context.fn(Handlebars.helpers.getOperation(context));
    }
  
  });
};