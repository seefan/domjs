/**
 * 处理浏览器存贮
 * @class app.store
 */
(function (w, service) {
    /**
     * 设置store插件的一个值
     * store是一个插件，可以根据浏览器自动选择存贮方式
     * @method setStore
     * @param key {string} 名称
     * @param value {object} 值
     */
    service.setStore = function (key, value) {
        cookie.set(key, value);
        if (window.localStorage) {
            return localStorage.setItem(key, value);
        }
    };
    /**
     * 删除store插件的一个值
     * @method removeStore
     * @param key
     */
    service.removeStore = function (key) {
        cookie.remove(key);
        if (window.localStorage) {
            return localStorage.removeItem(key);
        }
    };
    /**
     * 从store插件里取一个值
     * @method getStore
     * @param key {string}名称
     * @returns {object} 返回值，为空时反回false
     */
    service.getStore = function (key) {
        var value = cookie.get(key);
        if (value && value != 'undefined') {
            return value;
        }
        if (window.localStorage) {
            return localStorage.getItem(key);
        }
        return false;
    };
    /**
     * 设置一个值，自动给所有可用的方式赋值（包括h5的plus.storage，store和cookie）
     * @method set
     * @param key {string}名称
     * @param value {object} 值
     */
    service.set = function (key, value) {
        service.setStore(key, value);
        if (w.plus) {
            w.plus.storage.setItem(key);
        }
    };
    /**
     * 取一个值
     * @method get
     * @param key {string} 名称
     * @returns {object} 返回值，为空时反回false
     */
    service.get = function (key) {
        var value = service.getStore(key);
        if (value && value != 'undefined') {
            return value;
        }
        if (w.plus) {
            return w.plus.storage.getItem(key);
        }
        return false;
    };
    /**
     * 删除一个值
     * @method remove
     * @param key {string} 名称
     */
    service.remove = function (key) {
        service.removeStore(key);
        if (w.plus) {
            w.plus.storage.removeItem(key);
        }
    };
})(window, window.app.store = {}, window.store);