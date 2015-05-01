/*jslint browser: true, plusplus: true */
/*global angular */

/** @module Highlight
 @description The Highlight directive allows you to highlight portions of text inside DOM elements.  Set the `bb-highlight` attribute to the text you want to highlight and all matching text within the element will be highlighted.

Optionally use the `bb-highlight-beacon` attribute to reprocess the matching text content when content is changed.
 */


(function () {
    'use strict';

    angular.module('sky.highlight', [])
        .factory('bbHighlight', function () {
            var DATA_CLASS_NAME = 'bb-hightlight-class',
                DEFAULT_CLASS_NAME = 'highlight';
        
            // Copied and modified from here so we don't have yet another jQuery plugin dependency.
            // http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
            function highlight(el, pat, classn) {
                function innerHighlight(node, pat) {
                    var pos,
                        skip = 0,
                        spannode,
                        middlebit,
                        i,
                        middleclone;
                    
                    classn = classn || DEFAULT_CLASS_NAME;

                    el.data(DATA_CLASS_NAME, classn);
                    
                    if (node.nodeType === 3) {
                        pos = node.data.toUpperCase().indexOf(pat);
                        if (pos >= 0) {
                            spannode = document.createElement('span');
                            spannode.className = String(classn);
                            middlebit = node.splitText(pos);
                            middlebit.splitText(pat.length);
                            middleclone = middlebit.cloneNode(true);
                            spannode.appendChild(middleclone);
                            middlebit.parentNode.replaceChild(spannode, middlebit);
                            skip = 1;
                        }
                    } else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
                        for (i = 0; i < node.childNodes.length; ++i) {
                            i += innerHighlight(node.childNodes[i], pat);
                        }
                    }
                    return skip;
                }

                return el.length && pat && pat.length ? el.each(function () {
                    innerHighlight(this, pat.toUpperCase());
                }) : el;
            }

            function removeHighlight(el) {
                var classn = el.data(DATA_CLASS_NAME) || DEFAULT_CLASS_NAME;

                return el.find('span.' + classn).each(function () {
                    var parentNode = this.parentNode;

                    parentNode.replaceChild(this.firstChild, this);
                    parentNode.normalize();
                }).end();
            }

            highlight.clear = removeHighlight;

            return highlight;
        })
        .directive('bbHighlight', ['bbHighlight', function (bbHighlight) {
            return {
                link: function (scope, el) {
                    function highlight() {
                        bbHighlight.clear(el);

                        if (scope.highlightText) {
                            bbHighlight(el, scope.highlightText);
                        }
                    }

                    scope.$watch('highlightText', function () {
                        highlight();
                    });

                    scope.$watch('beacon', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            scope.$evalAsync(highlight);
                        }
                    }, true);
                },
                restrict: 'A',
                scope: {
                    highlightText: '=bbHighlight',
                    beacon: '=bbHighlightBeacon'
                }
            };
        }]);
}());
