/*global angular */

(function (window) {
    'use strict';

    function defineModule(moment) {
        angular.module('sky.moment', [])
            .constant('bbMoment', moment);
    }
    
    /*istanbul ignore next boilerplate require gunk */
    if (typeof window.define === 'function' && window.define.amd) {
        window.define(['moment'], defineModule);
    } else if (window.module !== undefined && window.module && window.module.exports) {
        defineModule(window.require('moment'));
    } else {
        defineModule(window.moment);
    }

}(this));