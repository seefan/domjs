/**
 * jsonp的实现类
 * @class jsonp
 */
(function (app, service, util, undefined) {
    service.request = {};//json的请求

    /**
     * 一个空函数
     */
    service.noop = function () {
    };

    var serialize = function (params, obj, traditional, scope) {
        var array = util.isArray(obj),
            hash = util.isPlainObject(obj);
        util.each(obj, function (key, value) {
            if (scope) {
                key = traditional ? scope :
                scope + '[' + (hash || util.isPlainObject(value) || util.isArray(value) ? key : '') + ']';
            }
            // handle data in serializeArray() format
            if (!scope && array) {
                params.add(value.name, value.value);
            }
            // recurse into nested objects
            else if (util.isArray(value) || (!traditional && util.isPlainObject(value))) {
                serialize(params, value, traditional, key);
            } else {
                params.add(key, value);
            }
        });
    };
    var serializeData = function (options) {
        if (options.data && typeof options.data !== "string") {
            options.data = service.param(options.data, options.traditional);
        }
        options.url = appendQuery(options.url, options.data);
        options.data = undefined;
    };
    var appendQuery = function (url, query) {
        if (query === '') {
            return url;
        }
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    };

    /**
     * 常用的ajax参数，只支持常用
     * @type {{type: string, success: function, error: function, complete: function, context: null, xhr: Function, accepts: {script: string, json: string, xml: string, html: string, text: string}, timeout: number, processData: boolean, cache: boolean}}
     */
    service.ajaxSettings = {
        success: service.noop,
        error: service.noop,
        complete: service.noop,
        context: null,
        timeout: 0,
        id: 0
    };

    var ajaxSuccess = function (data, settings) {
        if (settings.success) {
            settings.success.call(settings.context, data, 'success');
        }
        ajaxComplete('success', settings);
    };
    // type: "timeout", "error", "abort", "parsererror"
    var ajaxError = function (error, type, settings) {
        if (settings.error) {
            settings.error.call(settings.context, type, error);
        }
        ajaxComplete(type, settings);
    };
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    var ajaxComplete = function (status, settings) {
        if (settings.complete) {
            settings.complete.call(settings.context, status);
        }
    };
    service.param = function (obj, traditional) {
        var params = [];
        params.add = function (k, v) {
            if (typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number') {
                this.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
            }
        };
        serialize(params, obj, traditional);
        return params.join('&').replace(/%20/g, '+');
    };
    /**
     * 使用ajax请求数据，使用方法和jquery类似
     *
     * @method ajax
     * @param url {string} [可选] 请求的远程地址
     * @param options ajax请求的详细参数，可以为空，但url和options必须有一个参数
     */
    service.ajax = function (url, options) {
        if (typeof url === "object") {
            options = url;
            url = undefined;
        }
        var settings = options || {};

        settings.url = url || settings.url;
        for (var key in service.ajaxSettings) {
            if (settings[key] === undefined) {
                settings[key] = service.ajaxSettings[key];
            }
        }
        settings.id = util.hash(settings.url);
        if (!settings.data) {
            settings.data = {};
        }
        settings.data.jsonp_callback_id = settings.id;
        settings.data.jsonp_callback = 'app.jsonp.callback';
        serializeData(settings);

        settings.url = appendQuery(settings.url, '_=' + (new Date().getTime()));

        settings.timeout = 30000;


        if (settings.timeout > 0) {
            setTimeout(function () {
                delete(service.request[settings.id]);
                var js = document.getElementById(settings.id);
                if (js) {
                    document.body.removeChild(js);
                }
                ajaxError(null, 'timeout', this, settings);
            }, settings.timeout);
        }
        //把当前请求记录，不重复请求
        if (!service.request[settings.id]) {
            service.request[settings.id] = options;
            var script = document.createElement('script');
            script.id = settings.id;
            script.src = settings.url;
            document.body.appendChild(script);
        }
    };
    service.callback = function (id, data) {
        var settings = service.request[id];
        if (settings) {
            ajaxSuccess(data, settings);
            delete(service.request[id]);
            var js = document.getElementById(id);
            if (js) {
                document.body.removeChild(js);
            }
        }
    };
    service.get = function (url, param, callback, errorback) {
        if (!app.util.isPlainObject(param)) {
            param = {};
        }
        var opt = {};
        opt.url = url;
        opt.data = param;
        /**
         * 这里出错说明网络访问有问题
         * @param data
         */
        opt.error = function (data) {
            app.util.log('请求' + url + '错误，jsonp语法未成功。');

            if (!app.disableError) {
                data = {};
                data.error = '网络访问出错，请稍后再试。';
                data.reset = true;
                if (typeof errorback === 'function') {
                    errorback(data);
                } else {
                    app.error(data);
                }
            }
        };
        /**
         * 访问成功
         * @param data
         */
        opt.success = function (data) {
            if (typeof data == 'string' && data !== '') {
                data = util.eval('(' + data + ')');
            }
            if (data && (!data.error || data.error === 0 || data.error === '0')) {
                if (callback) {
                    callback(data);
                }
            } else {
                if (typeof errorback === 'function') {
                    errorback(data);
                } else {
                    app.error(data);
                }
            }
        };
        service.ajax(opt);
    };
})(window.domjs, window.domjs.jsonp = {}, window.domjs.util);

