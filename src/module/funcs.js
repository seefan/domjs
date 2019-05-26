(function (dj) {
    /**
     * 通用提示函数，默认调用window.alert()
     * @method alert
     * @param msg 提示信息
     */
    dj.alert = function (msg) {
        window.alert(msg);
    };
    /**
     * 显示自动消失的提示消息
     * @method toast
     * @param msg {string} 要显示的内容
     */
    dj.toast = function (msg) {
        window.alert(msg);
    };
    /**
     * 弹出一个确认框
     * @param message {string} 提示信息
     * @param callback {function} 确认后的回调
     */
    dj.confirm = function (message, callback) {
        if (window.confirm(message)) {
            callback();
        }
    };
    /**
     * 通用的返回函数，默认调用history.back()
     * @param reload {boolean} 是否刷新，默认为false
     * @method back
     */
    dj.back = function (reload) {
        if (document.referrer && reload === true) {
            window.location.href = document.referrer;
        } else {
            window.history.back();
        }
    };
    /**
     * 事件绑定，与jQuery相同的功能，默认也是直接使用jQuery.on
     *
     * @method on
     * @param owner {string|dom} 绑定事件的起点
     * @param eventName {string} 一个或多个用空格分隔的事件类型和可选的命名空间，如"click"或"keydown.myPlugin"
     * @param selector {string} 一个选择器字符串用于过滤器的触发事件的选择器元素的后代。如果选择的< null或省略，当它到达选定的元素，事件总是触发
     * @param data {object} 当一个事件被触发时要传递event.data给事件处理函数
     * @param callback {function} 该事件被触发时执行的函数。 false 值也可以做一个函数的简写，返回false
     */
    dj.on = function (owner, eventName, selector, data, callback) {
        if (typeof jQuery !== 'undefined') {
            jQuery(owner).on(eventName, selector, data, callback);
        }
    };
    /**
     * 跳转到指定页面
     * @method go
     * @param url {string} 目标地址
     * @param cacheName {string} [可选] 缓存的名称
     */
    dj.go = function (url, cacheName) {
        dj.util.gotoUrl(url, cacheName);
    };
    /**
     * 重置加载当前页面
     * @method reload
     */
    dj.reload = function () {
        window.location.reload();
    };
    /**
     * 显示登陆页，默认直接转到login.html页，登陆完成后调用app.closeLogin()关闭登陆页。
     * @method showLogin
     */
        //登陆页现在有3种，微信里，页面内容直接被替换为login.html，app里是新建一个login.html盖住当前页，测试时是直接转到login.html
        //关闭时，微信直接reload即可，app是关闭login页，测试是回退到上一页。
    dj.showLogin = function () {
        window.location.href = 'login.html';
    };
    /**
     * 关闭登陆页
     * @method closeLogin
     */
    dj.closeLogin = function () {
        dj.back(true);
    };

    /**
     * 通用的报错函数，如果data.error不为0就会显示错误
     * @method error
     * @param data 待检查数据
     */
    dj.error = function (data) {
        if (data && data.error == 'NotLogin') {
            dj.showLogin();
        } else {
            if (data && typeof data.error === 'string') {
                dj.toast(data.error);
            } else if (typeof data === 'string') {
                dj.toast(data);
            } else {
                if (dj.debug) {
                    dj.toast('Request error, please check the network!');
                    dj.util.log(data);
                }
            }
        }
    };
})(window.domjs);