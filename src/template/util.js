/**
 * 常用工具方法集合
 * @class Render.util
 */
(function (w, u, util) {
    'use strict';
    /**
     * 清理代码，主要是清理掉换行和空格
     *
     * @method trim
     * @param val {string} 要清理的内容
     */
    u.trim = function (val) {
        if (typeof(val) === 'string') {
            return val.replace(/\r/g, '').replace(/\n/g, '').replace('　', '').trim();
        } else if (u.isPlainObject(val)) {
            return u.trim(u.getDefaultValue(val));
        } else {
            return String.valueOf(val);
        }
    };
    /**
     * 给指定html网页中对象设置值，目前对img设置src，input设置value，其它设置innerHTML。
     * 此方法内部用。
     *
     * @param ele 对象实例
     * @param value 值
     */
    u.setValue = function (ele, value) {
        var tag = ele.tagName,
            i = 0, j = 0;
        var vs;
        var bs = u.getBindToNameList(ele);
        if (bs.length > 0) {
            for (i in bs) {
                var attrName = bs[i];
                if (ele.attributes[attrName]) {
                    ele.setAttribute(attrName, value);
                } else {
                    ele[attrName] = value;
                }
            }
        } else {
            util.bindElementValue(ele, value);
        }
    };

    /**
     * 过滤html，清理掉所有的html标签和换行空格
     *
     * @param html {string}
     * @returns {string}
     */
    u.html = function (html) {
        if (html && typeof(html) === 'string') {
            html = html.replace(/<[^<]*>/gi, '');
            return html.trim();
        } else {
            return u.getDefaultValue(html);
        }
    };
    /**
     * 取数组的key全集，内部使用
     * @param key
     * @param data
     * @returns {*}
     */
    u.getName = function (key, data) {
        var value = data[key];
        var type = typeof value;
        switch (type) {
            case 'string':
            case 'number':
            case 'boolean':
                return [key];
            case 'object':
                if (u.isArray(value)) {
                    return [key];
                } else {
                    var names = [];
                    for (var k in value) {
                        //跳过非属性
                        if (value.hasOwnProperty(k)) {
                            var tkv = u.getName(k, value);
                            for (var i = 0; i < tkv.length; i++) {
                                names.push(key + '.' + tkv[i]);
                            }
                        }
                    }
                    return names;
                }
                break;
            default:
                return [];
        }
    };


    /**
     * 取指定数组的值，内部用
     * @param key
     * @param data
     * @returns {*}
     */
    u.getValue = function (key, data) {
        var keys = key.split('.'),
            result = data[keys.shift()];
        for (var i = 0; result && i < keys.length; i++) {
            result = result[keys[i]];
        }
        //
        return u.getDefaultValue(result);
    };
    /**
     * 取值，支持两种数据，简单变量和数组，如果为null或是undefined，自动转为空串。内部用
     * @param val
     * @returns {*}
     */
    u.getDefaultValue = function (val) {
        if (val === null || typeof val === 'undefined') {
            return '';
        } else {
            return val;
        }
    };

    /**
     * 取绑定名列表，多个绑定名用空格分开，内部用
     * @param item 目标
     * @returns {Array} 返回绑定名列表
     */
    u.getBindToNameList = function (item) {
        var binds = item.attributes['data-bind-to'];
        var re = [];
        if (binds && binds.value) {
            var sps = binds.value.split(' ');
            var tmp, i = 0;
            for (; i < sps.length; i++) {
                tmp = u.trim(sps[i]);
                if (tmp !== '') {
                    re.push(tmp);
                }
            }
        }
        return re;
    };


    /**
     * 显示一个对象
     * 设置style.display=''，同时去掉class中名为hide样式
     *
     * @method show
     * @param ele {string} 要显示的对象实例
     * @param isTrue {boolean} 是否显示，默认为true
     */
    u.show = function (ele, isTrue) {
        if (ele) {
            if (isTrue !== false) {
                if (ele.style.display === 'none') {
                    ele.style.display = '';
                }
                util.removeClass(ele, 'hide');
            } else {
                ele.style.display = 'none';
            }
        }
    };
})(window, window.domjs.template.util, window.domjs.util);