(function(dj){

    /**
     *请求并绑定远程数据，支持数组和单变量绑定，功能全面
     *
     * 示例：
     *
     *     dj.ajaxBind('data','getNews');//简单绑定
     *
     *     dj.ajaxBind('data','getNews','',function(e){//数据过滤
     *         return e.data;//这里可以自定义处理一些内容。
     *     });
     *     dj.ajaxBind('data','getNews','',function(e){//数据过滤
     *             return e.data;//这里可以自定义处理一些内容。
     *         },
     *         function(e){
     *             alert('ok');
     *         },
     *         function(){
     *              alert('error');
     *         }
     *     );
     *
     * @method ajaxBind
     * @param {string} id           绑定名，如果为空，绑定数组时默认为data，绑定Object时为''
     * @param {string} postUrl      请求的api地址，这个地址不需要完整的地址，root+apiroot+postUrl是完全的请求路径
     * @param {Object} param       [可选]  请求的参数，参数如果为''或未设置时，则直接使用调用页的参数
     * @param {function} datafilter  [可选]  数据过滤，只返回有效数据时行绑定，将需要绑定的数据return，如果不指定，可以使用false，这时自动使用取名称data的数据进行绑定
     * @param {function} callback    [可选] 请求成功的回调
     * @param {function} errorback    [可选] 请求失败的回调
     */
    dj.ajaxBind = function (id, postUrl, param, datafilter, callback, errorback) {
        if (typeof postUrl == 'undefined') {
            postUrl = id;
            id = '';
        }
        return dj.ajax(postUrl, param).bind(id).filter(datafilter).success(callback).error(errorback);
    };
    /**
     * 支持独立设置的ajax请求方法
     *
     * 示例：
     *
     *     dj.ajax(postUrl, param).bind(id).filter(datafilter).success(callback).error(errorback);
     *
     *     filter：数据过虑回调
     *     success：请求成功回调
     *     error：请求出错回调
     *     bind：指定绑定名称
     *     isAppend：是否在绑定数组时使用追加
     *
     * @param postUrl 请求的api地址，这个地址不需要完整的地址，root+apiroot+postUrl是完全的请求路径
     * @param {Object} param       [可选]  请求的参数，参数如果为''或未设置时，则直接使用调用页的参数
     * @returns {ajax} 一个ajax请求的对象，支持filter、success、error、bind、isAppend几个方法。
     */
    dj.ajax = function (postUrl, param) {
        if (param === '' || typeof param == 'undefined') {
            param = dj.util.getUrlQuery();
        }
        var option = {
            id: '',
            url: postUrl,
            param: param,
            f_datafilter: undefined,
            f_success: undefined,
            f_error: function (data) {
                dj.error(data);
            },
            isAppend: false,
            isAnimation: dj.animationBind
        };
        /**
         * 数据过虑回调
         * @method filter
         * @param val
         */
        option.filter = function (val) {
            if (typeof val === 'function') {
                this.f_datafilter = val;
            }
            return this;
        };
        /**
         * 请求成功回调
         * @method success
         * @param val
         */
        option.success = function (val) {
            if (typeof val === 'function') {
                this.f_success = val;
            }
            return this;
        };
        /**
         * 请求出错回调
         * @method error
         * @param val
         */
        option.error = function (val) {
            if (typeof val === 'function') {
                this.f_error = val;
            }
            return this;
        };
        /**
         * 指定绑定的id
         * @method bind
         * @param val
         */
        option.bind = function (val) {
            this.id = val;
            return this;
        };
        /**
         * 是否在绑定数组时使用追加
         * @method isAppend
         * @param val
         */
        option.append = function (val) {
            this.isAppend = val === true;
            return this;
        };
        /**
         * 是否启动动画效果
         * @param val
         * @returns {option}
         */
        option.animation = function (val) {
            this.isAnimation = val === true;
            return this;
        };

        if (!dj.util.isPlainObject(option.param)) {
            option.param = {};
        }
        if (dj.login) {
            option.param.token = dj.login.token;
        }
        if (dj.enableJsonp) {
            dj.jsonp.get(dj.root + dj.apiroot + option.url, option.param, function (e) {
                success(option, e);
            }, function (e) {
                option.f_error(e);
            });
        } else {
            dj.http.post(dj.root + dj.apiroot + option.url, option.param, function (e) {
                success(option, e);
            }, function (e) {
                option.f_error(e);
            });
        }

        return option;
    };
    function success(option, e) {
        var data;
        if (option.f_datafilter !== undefined) {
            data = option.f_datafilter(e);
        } else {
            data = e.data;
        }
        //bind data
        if (data) {
            if (dj.util.isArray(data)) {
                if (data.length > dj.animationBindMin) {
                    r.bindRepeatData(option.id, data, option.isAppend, option.isAnimation);
                } else {
                    r.bindRepeatData(option.id, data, option.isAppend);
                }
            } else {
                if (option.id) {
                    r.bindData(option.id, data);
                } else {
                    r.bindData(data);
                }
            }
        }
        //bind end
        if (option.f_success !== undefined) {
            option.f_success(data);
        }
    }
/**
     * 提示一个表单数据到远程
     * 示例：
     *
     *     dj.postForm('formid','getNews');
     *
     *     dj.postForm(['username','password'],'getNews');
     *
     * @method postForm
     * @param name {string|array|object} 表单的id或是表单元素名称的数组或是表单本身(this)
     * @param postUrl {string} 远程的url
     * @param param  [可选] 附加的参数
     * @param callback {function} [可选] 成功的回调
     * @param errorback {function}  [可选] 失败的回调
     */
    dj.postForm = function (name, postUrl, param, callback, errorback) {
        if (typeof param === 'function') {
            errorback = callback;
            callback = param;
            param = {};
        }

        if (!dj.util.isPlainObject(param)) {
            param = {};
        }

        var formParam = dj.form.getFormParam(name, true);
        if (formParam === undefined) {
            return;
        }
        //传入的参数优先级最高
        for (var k in param) {
            if (k !== '' && param[k]) {
                formParam[k] = param[k];
            }
        }
        dj.post(postUrl, formParam, callback, errorback);
    };
    /**
     * 请求数据，同时使用通用的处理方式处理数据错误。如果指定的错误的处理方式，就用指定的方式。
     * 请求时会自动带上登陆信息token
     * 请求返回的必须json格式数据，如果为文本，会自动强转为json
     * 请求数据时，url前会自动加上this.root + this.apiroot，而http模块下的post不会自动修改url
     *
     * 示例：
     *
     *     dj.post('getNews',{"id":1},function(data){
     *         console.log(data);
     *     });
     *
     * @method post
     * @param url {string} 请求的地址
     * @param param 附加的参数，如果加载的登陆模块，则自动附加token参数
     * @param callback {function} [可选] 请求成功的回调参数
     * @param errorback {function} [可选] 失败的回调参数。如果为空使用默认的错误处理
     */
    dj.post = function (url, param, callback, errorback) {
        if (typeof param === "function") {
            errorback = callback;
            callback = param;
            param = {};
        }
        if (param === '' || typeof param == 'undefined') {
            param = r.util.getUrlQuery();
        }
        if (!dj.util.isPlainObject(param)) {
            param = {};
        }
        if (dj.login) {
            param.token = dj.login.token;
        }
        if (typeof errorback != 'function') {
            errorback = dj.error;
        }
        dj.http.post(dj.root + dj.apiroot + url, param, callback, errorback);
    };
    /**
     * 请求数据，同时使用通用的处理方式处理数据错误。如果指定的错误的处理方式，就用指定的方式。
     * 请求时会自动带上登陆信息token
     * 请求返回的必须json格式数据，如果为文本，会自动强转为json
     * 请求数据时，url前会自动加上this.root + this.apiroot，而http模块下的post不会自动修改url
     * 与app.post的区别在于如果jsonp可用，会优先使用jsonp，其次用post.
     *
     * 示例：
     *
     *     dj.get('getNews',{"id":1},function(data){
     *         console.log(data);
     *     });
     *
     * @method get
     * @param url {string} 请求的地址
     * @param param 附加的参数，如果加载的登陆模块，则自动附加token参数
     * @param callback {function} [可选] 请求成功的回调参数
     * @param errorback {function} [可选] 失败的回调参数。如果为空使用默认的错误处理
     */
    dj.get = function (url, param, callback, errorback) {
        if (typeof param === "function") {
            errorback = callback;
            callback = param;
            param = {};
        }
        if (param === '' || typeof param == 'undefined') {
            param = r.util.getUrlQuery();
        }
        if (!dj.util.isPlainObject(param)) {
            param = {};
        }
        if (dj.login) {
            param.token = dj.login.token;
        }
        if (typeof errorback != 'function') {
            errorback = dj.error;
        }
        if (dj.enableJsonp) {
            dj.jsonp.get(dj.root + dj.apiroot + url, param, callback, errorback);
        } else {
            dj.http.post(dj.root + dj.apiroot + url, param, callback, errorback);
        }

    };


    /**
     * 数组自动绑定，当没有数据时自动显示[id]_empty的内容，只解决简单的绑定及无数据提示。
     * 返回的数据中要时行绑定的数据名固定为data
     *
     * 示例：返回的数据为{"error":0,"data":{"id":1}}，本方法将自动返回data部分
     *
     *     dj.iBind('getNews');//取getNews的数据，并绑定，未指定绑定名
     *     dj.iBind('data','getNews');//取getNews的数据，并绑定，指定绑定名为data
     *
     * 以上都未设置参数param的值，param将进行自动设置，默认为当前页的url的参数，详见XTemplate
     *
     *     dj.iBind('data','getNews',{"id":10});//指定参数和绑定名，取getNews的数据
     *
     * @method iBind
     * @param id 绑定名 [可选]
     * @param postUrl 请求的api地址，这个地址不需要完整的地址，root+apiroot+postUrl是完全的请求路径
     * @param param [可选] 请求的参数，参数如果为''或未设置时，则直接使用调用页的参数
     * @param callback {function} [可选] 回调函数
     */
    dj.iBind = function (id, postUrl, param, callback) {
        if (typeof postUrl == 'undefined') {
            postUrl = id;
            id = '';
        }
        if (typeof param === "function") {
            callback = param;
            param = undefined;
        }
        dj.util.setHide('#' + id + '_loading', false);
        return dj.ajax(postUrl, param).filter(function (e) {
            if (e.data) {
                if (dj.util.isArray(e.data)) {
                    if (e.data.length > 0) {
                        dj.util.setHide('#' + id + '_empty');
                    } else {
                        dj.util.setHide('#' + id + '_empty', false);
                    }
                }
                return e.data;

            }
            dj.util.setHide('#' + id + '_loading');
            return false;
        }).success(callback).bind(id);
    };
})(window.domjs);