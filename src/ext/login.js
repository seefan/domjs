/**
 * 登陆处理
 * @class app.login
 */
(function (app, service) {
    /**
     * 登陆信息校验值
     * @property token
     * @type {string}
     */
    service.token = '';
    /**
     * 登陆用户名称
     * @property name
     * @type {string}
     * @default '匿名用户'
     */
    service.name = '匿名用户';
    /**
     * 登陆用户级别
     * @property className
     * @type {string}
     * @default '普通用户'
     */
    service.className = '普通用户';
    /**
     * 设置登陆用户信息
     *
     * @method setLogin
     * @param token {string} 校验信息
     * @param name {string} 用户名
     * @param className {string} 级别
     */
    service.setLogin = function (token, name, className) {
        service.token = token;
        app.store.set('app_online_user_token', token);

        if (typeof name === 'string' && name != '') {
            service.name = name;
            app.store.set('app_online_user_name', name);
        }

        if (typeof className != 'undefined') {
            service.className = className;
            app.store.set('app_online_user_class', className);
        }
    };
    /**
     * 使用存贮的token进行自动登陆
     *
     * @method tokenLogin
     * @param  callback {function} [可选] 如果成功登陆进行的回调
     */
    service.tokenLogin = function (callback) {
        var token = app.store.get('app_online_user_token');
        var name = app.store.get('app_online_user_name');
        //check login
        if (token && token.length > 9) {
            app.post('autoLogin', {
                token: token,
                username: name
            }, function (e) {//登陆成功
                if (e.logined) {
                    service.setLogin(e.data.token, e.data.name, e.data.className);
                }
                if (callback) {
                    callback(e.logined);
                }
            });
        }
    };

    /**
     * 退出登陆
     *
     * @method loginOut
     * @param callback {function} [可选] 退出后的回调
     */
    service.loginOut = function (callback) {
        service.token = '';
        service.name = '匿名用户';
        service.className = '普通用户';
        app.store.remove('app_online_user_token');
        app.store.remove('app_online_user_name');
        app.store.remove('app_online_user_class');
        if (callback) {
            callback();
        }
    };
    /**
     * 登陆系统
     *
     * @method loginIn
     * @param _username {string} 用户名
     * @param _password {string}  密码
     * @param callback {function} 登陆成功后的回调
     */
    service.loginIn = function (_username, _password, callback) {
        if (_username && _password) {
            app.post('doLogin', {
                username: _username,
                password: _password
            }, function (data) {//登陆成功
                this.setLogin(data.token, data.name, data.className);
                if (callback) {
                    callback();
                }
            });
        } else {
            app.error('登陆系统的用户名和密码不能为空！');
        }
    };
    /**
     * 从内部存贮取登陆信息保存到app.login
     * @method autoLogin
     */
    service.autoLogin = function () {
        var token = app.store.get('app_online_user_token');
        var name = app.store.get('app_online_user_name');
        var className = app.store.get('app_online_user_class');
        if (token && token.length > 9) {//如果有信息
            service.token = token;
            if (name) {
                service.name = name;
            }
            if (className) {
                service.className = className;
            }
        }
    };
    /**
     * 是否已经登陆
     * @method isLogin
     * @returns {boolean}
     */
    service.isLogin = function () {
        return this.token && this.token.length > 9;
    };
    //所有界面自动取一下自动登陆信息
    app.initFunction.push(service.autoLogin);
})(window.app, window.app.login = {});