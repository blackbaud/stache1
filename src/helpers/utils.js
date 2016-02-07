(function () {
    "use strict";

    module.exports = {

        /**
         *
         * @param {} []
         */
        cleanArray: function (arr) {
            for (var i = 0; i < arr.length; ++i) {
                if (arr[i] === undefined) {
                    arr.splice(i, 1);
                    i--;
                }
            }
            return arr;
        },

        /**
         * Returns a single array, the second appended to the first.
         *
         * @param {array} [arr1] The array to be extended.
         * @param {array} [arr2] The array to be appended to the first.
         */
        concatArray: function (arr1, arr2) {
            var i,
                len,
                arr1IsArray,
                arr2IsArray;

            arr1IsArray = (arr1.pop && arr1.push);
            arr2IsArray = (arr2.pop && arr2.push);

            if (!arr1IsArray && !arr2IsArray) {
                return [];
            }
            if (!arr2IsArray && arr1IsArray) {
                return arr1;
            }
            if (!arr1IsArray && arr2IsArray) {
                return arr2;
            }

            len = arr2.length;

            for (i = 0; i < len; ++i) {
                arr1.push(arr2[i]);
            }

            return arr1;
        },


        /**
         *
         * @param {} []
         * @param {} []
         */
        forAll: function (arr, callback) {
            var level,
                self,
                temp,
                tempIndex;

            level = 0;
            self = this;
            temp = [];
            tempIndex = 0;

            arr.forEach(function (item, i) {
                var allowChildren = true;
                var omitted = false;
                var key;
                var tempItem = {};

                // Let the callback do stuff with this item.
                callback.call({
                    getLevel: function () {
                        return level;
                    },
                    omit: function () {
                        omitted = true;
                    },
                    omitChildren: function () {
                        allowChildren = false;
                    },
                    updateItem: function (obj) {
                        item = obj;
                    }
                }, item, i);


                // The callback doesn't want this one included.
                if (omitted) {
                    return;
                }

                // Should we continue into a child array?
                if (allowChildren) {

                    // Include this item.
                    temp.push(item);

                    for (key in item) {
                        if (item[key] && item[key].pop && item[key].push) {
                            level++;
                            temp[tempIndex][key] = self.forAll(item[key], callback);
                        }
                    }
                } else {
                    for (key in item) {
                        if (item[key] && item[key].pop === undefined || item[key].push === undefined) {
                            tempItem[key] = item[key];
                        }
                    }
                    temp.push(tempItem);
                }

                // Increase the temp array's index so we can use it recursively.
                tempIndex++;

            });

            return temp;
        },


        /**
         * Function for arranging an array for vertical display.
         *
         * @param {} []
         * @param {} []
         */
        stackArray: function (arr, numColumns) {
            var index,
                temp = [],
                row = 0,
                col = 0,
                len = arr.length,
                rows = Math.ceil(len / numColumns);

            while (row < rows) {
                index = row + (col * rows);
                if (index >= len) {
                    row++;
                    col = 0;
                } else {
                    temp.push(arr[index]);
                    col++;
                }
            }

            return temp;
        }

    };

}());