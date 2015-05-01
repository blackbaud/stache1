/*jslint browser: true */
/*global angular */

(function () {
    'use strict';

    var modules = [
        'sky.autofocus',
        'sky.autonumeric',
        'sky.charts',
        'sky.check',
        'sky.checklist',
        'sky.data',
        'sky.datefield',
        'sky.daterangepicker',
        'sky.filters',
        'sky.format',
        'sky.grids',
        'sky.help',
        'sky.helpbutton',
        'sky.helpwidget',
        'sky.highlight',
        'sky.mediabreakpoints',
        'sky.modal',
        'sky.moment',
        'sky.money',
        'sky.navbar',
        'sky.omnibar',
        'sky.page',
        'sky.pagination',
        'sky.popover',
        'sky.resources',
        'sky.scrollintoview',
        'sky.searchfield',
        'sky.tabs',
        'sky.tabscroll',
        'sky.tabsref',
        'sky.templates',
        'sky.templating',
        'sky.textexpand',
        'sky.tiles',
        'sky.tooltip',
        'sky.validation',
        'sky.viewkeeper',
        'sky.wait',
        'sky.window',
        'sky.wizard'
    ];

    try {
        angular.module('toastr');
        modules.push('sky.toast');
    } catch (ignore) {
        /* The toastr module isn't defined.  Do not load sky.toast module */
    }

    angular.module('sky', modules);

}());