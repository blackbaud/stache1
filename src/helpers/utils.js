module.exports = function () {

    return {

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

            arr1IsArray = Handlebars.Utils.isArray(arr1);
            arr2IsArray = Handlebars.Utils.isArray(arr2);

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
        }
    };
};
