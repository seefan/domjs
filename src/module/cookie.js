/**
 * cookie 通过处理类
 */
(function (document,window) {

    var cookie = function () {
        return cookie.get.apply(cookie, arguments);
    };

    var utils = cookie.utils = {
        // Unlike JavaScript's built-in escape functions, this method
        // only escapes characters that are not allowed in cookies.
        encode: function (value) {
            return String(value).replace(/[,;"\\=\s%]/g, function (character) {
                return encodeURIComponent(character);
            });
        },

        decode: function (value) {
            return decodeURIComponent(value);
        }
    };
    cookie.expiresMultiplier = 60 * 60 * 24;

    cookie.set = function (key, value, expires) {
        expires = new Date(new Date() + 1000 * this.expiresMultiplier * expires); // This is needed because IE does not support the `max-age` cookie attribute.

        if (expires !== '' && 'toGMTString' in expires) expires = ';expires=' + expires.toGMTString();

        document.cookie = utils.encode(key) + '=' + utils.encode(value) + expires;


        return this; // Return the `cookie` object to make chaining possible.
    };

    cookie.remove = function (keys) {
        this.set(keys, '', -1);
        return this; // Return the `cookie` object to make chaining possible.
    };


    cookie.get = function (keys) {
        var cookies = this.all();
        return cookies[keys];
    };

    cookie.all = function () {
        if (document.cookie === '') return {};

        var cookies = document.cookie.split('; '),
            result = {};

        for (var i = 0, l = cookies.length; i < l; i++) {
            var item = cookies[i].split('=');
            var key = utils.decode(item.shift());
            var value = utils.decode(item.join('='));
            result[key] = value;
        }

        return result;
    };
    // If an AMD loader is present use AMD.
    // If a CommonJS loader is present use CommonJS.
    // Otherwise assign the `cookie` object to the global scope.

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return cookie;
        });
    } else window.cookie = cookie;
// If used e.g. with Browserify and CommonJS, document is not declared.
})(document,window);
