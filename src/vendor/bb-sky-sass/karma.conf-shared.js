/*jshint node: true */

/**
 * Karma configuration options shared between CI and local versions.
 */
module.exports = {
    singleRun: false,
    autoWatch: false,
    basePath: '',
    frameworks: [
        'jasmine'
    ],
    files: [
        'bower_components/jquery/dist/jquery.js',
        'bower_components/jquery-ui/jquery-ui.js',
        'bower_components/jqueryui-touch-punch/jquery.ui.touch-punch.min.js',
        'bower_components/enquire/dist/enquire.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/responsive-tabs/js/jquery.responsiveTabs.js',
        'libs/easyXDM.js',
        'bower_components/moment/moment.js',
        'bower_components/autoNumeric/autoNumeric.js',
        'bower_components/jqgrid/js/jquery.jqGrid.js',
        'bower_components/angular-toastr/dist/angular-toastr.tpls.js',
        'bower_components/bootstrap-datepicker-eyecon/js/bootstrap-datepicker.js',
        'bower_components/bootstrap-js-components/dist/dropdown.min.js',
        'bower_components/blockui/jquery.blockUI.js',
        'bower_components/jquery-icheck/icheck.js',
        'bower_components/angular-ui-select/dist/select.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
        'js/sky/src/*/*.js',
        'dist/js/locales/sky-locale-en-US.js',
        'js/sky/templates/templates.js.tmp',
        'js/**/*.spec.js',
        'dist/css/*.css',
        {
            pattern: 'dist/css/fonts/*.*',
            included: false,
            served: true
        }
    ],
    exclude: [
        'src/**/docs/*',
        'js/sky/src/charts/**', // Being moved to RE NXT
        'js/sky/src/helpwidget/**', // Deprecated
        'js/sky/src/money/**', // Deprecated
        'js/sky/src/tabs/**' // Deprecated
    ],
    preprocessors: {
        'js/sky/src/*/*.js': [
            'coverage'
        ]
    },
    reporters: [
        'dots',
        'coverage',
    ],
    coverageReporter: {
        dir: 'coverage/',
        reporters: [
            {
                type: 'html'
            }
        ]
    }
};