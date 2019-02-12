/**
 * 处理常规的http请求
 * @class app.http
 */
(function (app, util, service) {
    /**
     * 是否允许失败后再次请求数据
     * @property enableRetry
     * @type {boolean}
     * @default true
     */
    service.enableRetry = true;
    /**
     * 请求数据，同时使用通用的处理方式处理数据错误。如果指定的错误的处理方式，就用指定的方式。
     * 请求返回的必须json格式数据，如果为文本，会自动强转为json
     *
     * 示例：
     *
     *     app.http.post('http://www.seefan.net/api/getNews',{"id":1},function(data){
     *         console.log(data);
     *     });
     *
     * @method post
     * @param url {string} 请求的地址
     * @param param 附加的参数
     * @param callback {function} 请求成功的回调参数，可以为空
     * @param errorback {function} 失败的回调参数，可以为空。如果为空使用默认的错误处理
     * @param second {object} 失败的回调参数，可以为空。如果为空使用默认的错误处理
     */
    service.post = function (url, param, callback, errorback, second) {
        if (app.optAjax === false) {
            app.error('No configuration ajax execution class');
            return;
        }
        if (!app.util.isPlainObject(param)) {
            param = {};
        }


        var opt = {};

        opt.url = url;
        opt.type = 'POST';
        opt.dataType = 'json';
        opt.data = param;
        opt.async = true;
        /**
         * 这里出错说明网络访问有问题
         * @param data
         */
        opt.error = function (data) {
            app.util.log('request ' + url + ' failed,message:' + data.statusText + ",status:" + data.status + '，return:' + data.responseText);
            if (second === true) {
                data = {};
                data.error = '网络访问出错，请稍后再试。';
                data.reset = true;
                if (typeof errorback === 'function') {
                    errorback(data);
                } else {
                    if (!app.disableError) {
                        app.error(data);
                    }
                }
            } else if (service.enableRetry) {
                service.post(url, param, callback, errorback, true);
            }
        };
        /**
         * 访问成功
         * @param data
         */
        opt.success = function (data) {
            if (typeof data === 'string' && data !== '') {
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
        app.optAjax.ajax(opt);
    };
})
(window.domjs, window.domjs.util, window.domjs.http = {});