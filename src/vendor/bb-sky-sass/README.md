[![Build Status](https://magnum.travis-ci.com/blackbaud/sky.svg?token=sJ8gpzdFTibjNFQuHgFg&branch=master)](https://magnum.travis-ci.com/blackbaud/sky)
# Sky

The Sky library contains CSS and Angular components for building web applications at Blackbaud that adhere to the Sky UX patterns.

## Installation

You may install Sky via Bower with the following command:

`bower install git+https://github.com/blackbaud/sky`

Directly installing via Bower will pull down the entire source tree.  For a more targeted installation it is recommended that you use [grunt-bower-task](https://github.com/yatskevich/grunt-bower-task)  to pull down only the files you need.  Most of the files you'll need are in the /dist folder, but you may want to include the Sass source files so that you can incorporate it into your own Sass files and reference its variables and mixins.  In this case your bower.json file's exportsOverride section would look something like this:

    "exportsOverride": {
        "bb-sky": {
            "js": "dist/js",
            "scss": "scss",
            "css": "dist/css"
        }
    }

## Usage

To use Sky, simply include all the dependent libraries in your HTML page followed by `sky.js` in the `dist/js` folder and `sky.css` in the `dist/css` folder.  It is highly recommended that you combine and minify the Sky JavaScript files with its dependencies using something like [grunt-contrib-concat](https://github.com/kozy4324/grunt-concat-sourcemap).

Sky also ships with locale files that contain localized strings for other languages (currently limited to en-GB).  To use these localized files, simply include the appropriate file after you've included the main Sky library.

    <script src="js/sky.js"></script>
    <script src="js/locales/sky-locale-en-GB.js"></script>

Note that Sky's default locale is en-US, if that is the only locale your product supports there is no need to additionally include the `sky-locale-en-US.js` file.

If you want to integrate Sky into your own Sass source so you can reference its variables and mixins, you can include the `scss/sky.scss` file into your own Sass file.  You will also need to specify the paths to the various fonts used by Sky before including the `sky.scss` file.  Example:

    $icon-font-path: 'bb-sky/css/fonts/';
    $fa-font-path: 'bb-sky/css/fonts';

## Contributing

We highly encourage contributions from all users of Sky.  We just ask that you follow the coding conventions already established in the existing code, and that you write the appropriate documentation and unit tests to go along with your feature.

### Getting the code

1. Fork the master branch into your own repo
2. Create a branch named after the feature you will be contributing (.e.g. my-new-feature)
3. Clone your repo locally, then run `npm install` and `bower install` to install all required dependencies

### Writing the code

1. Launch a command prompt, `cd` to the folder where you cloned your branch, then run `grunt watchandtest`.  
If you have Visual Studio with the [Task Runner Explorer](https://visualstudiogallery.msdn.microsoft.com/8e1b4368-4afb-467a-bc13-9650572db708) extension, you should open the repo folder as a web site via File > Open > Web Site.  The `grunt watchandtest` task will then run automatically.
2. Write your code, documentation and unit tests.  All new code must have 100% unit test coverage and include documentation for how to use the feature or the pull request will not be accepted.  

  - You should include documentation for each sky module you create within your source code. We use JsDoc style comments at the top JavaScript files to generate markdown documentation. You can generate the markdown documentation by either saving the demo.js or demo.html files in your feature's docs folder, or you can use the command `grunt generatedocs` from the command line. The standard format for the inline documentation is as follows: 


    /** @module Mymodulename  
        @description ### Header with markdown ###  
 
        - relevant properties  
    */

  
  - Your documentation should also include demo HTML, and demo JS in a folder called `docs` under your feature's folder in `src/js`.  As you update these files, the `grunt watchandtest` task will generate documentation which you can find under `demo/directives`.  The documentation page will need to be hosted by a web server; you can use a Node package like [http-server](https://github.com/indexzero/http-server) to start a web server in any folder on your drive.
 - Your unit tests should be located in a folder called `test` under your feature's folder in `src/js` and should consist of one or more JavaScript files named `<featurename>.spec.js`.  As you write unit tests or change code, the `grunt watchandtest` task will run your unit tests and generate code coverage.  Code coverage reports can be located under `coverage/<browser version>/index.html` and can be launched straight from disk.

### Submitting the code

1. Commit and push your changes to your repo
2. Submit a pull request

## Filing Issues

To file a bug, just go to the [issues](https://github.com/blackbaud/sky/issues) page and create a new issue with the bug label. You can assign the bug to yourself if you intend to create a fix and pull request, you can assign it to a specific sky contributor, or you can leave it unassigned and we'll assign it to the appropriate parties. We are operating under the expectation that we will close bugs within two weeks of filing. On the newly created issue, there will be an option for you to subscribe to notifications, which will send you emails about commits, comments, and releases related to the bug so you can know exactly where the bug is within its life cycle.
