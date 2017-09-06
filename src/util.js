/**
 * app的工具函数集合
 * @class app.util
 */
(function(util, document, w, undefined) {
    /**
     * 在指定对象平级附加一个对象
     * @method setValue
     * @param newEl
     * @param targetEl
     */
    util.insertAfter = function(newEl, targetEl) {
        var parentEl = targetEl.parentNode;
        if (!parentEl) {
            return;
        }
        if (parentEl.lastChild == targetEl) {
            parentEl.appendChild(newEl);
        } else {
            parentEl.insertBefore(newEl, targetEl.nextSibling);
        }
    };


    /**
     * 给指定dom设置值
     *
     * 示例：
     *
     *     setValue('#username','jake')
     *     setValue('.username','jake')
     *     setValue('p','jake')
     *
     * @method setValue
     * @param selecter 选择器 可以是#id|.className|p|[attribute]|[attribute=value]等等，详见css选择器
     * @param value
     */
    util.setValue = function(selecter, value) {
        if (util.isPlainObject(value)) {
            value = JSON.stringify(value);
        }
        util.each(util.querySelectorAll(selecter), function(i, ele) {
            switch (ele.tagName) {
                case 'IMG':
                    ele.src = value;
                    break;
                case 'INPUT':
                    ele.value = value;
                    break;
                default:
                    if (typeof ele.innerText != 'undefined') {
                        ele.innerText = value;
                    } else {
                        ele.value = value;
                    }
                    break;
            }
        }, true);
    };
    /**
     * 设置指定目标不可用
     * @method setDisabled
     * @param selector {string} 选择器 可以是#id或是.className，详见css选择器
     * @param truefalse {boolean} 是否可用，默认为true
     */
    util.setDisabled = function(selector, truefalse) {
        if (truefalse === undefined) {
            truefalse = true;
        }
        util.each(util.querySelectorAll(selector), function(i, ele) {
            ele.disabled = truefalse;
        }, true);
    };
    /**
     * 设置指定目标是否隐藏
     * @method setHide
     * @param selector {string} 选择器 可以是#id或是.className，详见css选择器
     * @param truefalse {boolean} 是否可用，默认为true
     */
    util.setHide = function(selector, truefalse) {
        if (truefalse === undefined) {
            truefalse = true;
        }
        util.each(util.querySelectorAll(selector), function(i, ele) {
            if (truefalse) {
                if (ele.style.display != 'none') {
                    ele.style.display = 'none';
                }
            } else {
                if (ele.style.display == 'none') {
                    ele.style.display = '';
                }
                util.removeClass(ele, 'hide');
            }
        }, true);
    };
    /**
     * 定时回调，在指定时间内，每秒回调1次，主要用于读秒更新。
     *
     * 示例：
     *
     *     timedCallback(60,function(s){
     *         $('#tip').text(s+'秒后开始');
     *     });
     *
     * @method timedCallback
     * @param seconds {number} 秒
     * @param callback {function} 每秒的回调
     */
    util.timedCallback = function(seconds, callback) {
        if (callback) {
            if (callback(seconds) === true) {
                seconds = 0;
            }
        }
        seconds--;
        if (seconds >= 0) {
            setTimeout(function() {
                util.timedCallback(seconds, callback);
            }, 1000);
        }
    };
    /**
     * 循环处理
     *
     * 示例：
     *
     *     app.util.each([1,2,3],function(i,a){});
     *
     *
     * @method each
     * @param object {Array|object} 要循环的对象
     * @param callback {function} 处理的函数
     * @returns {*}
     */
    util.each = function(object, callback) {
        if (!object || !callback) {
            return;
        }
        var name, i = 0,
            length = object.length,
            isObj = length === undefined || typeof(object) == 'function';
        if (isObj) {
            for (name in object) {
                if (callback.call(object[name], name, object[name]) === false) {
                    break;
                }
            }
        } else {
            for (; i < length;) {
                if (callback.call(object[i], i, object[i++]) === false) {
                    break;
                }
            }
        }
        return object;
    };


    /**
     * 判断类型是否是Array
     * @method isArray
     * @param object 要判断的对象
     * @returns {boolean}
     */
    util.isArray = Array.isArray || function(object) {
        return object instanceof Array;
    };

    // Copy all but undefined properties from one or more
    // objects to the `target` object.
    util.extend = function(target) {
        var i, k, obj;
        for (i = 1; i < arguments.length; i++) {
            obj = arguments[i];
            if (util.isPlainObject(obj)) {
                for (k in obj) {
                    if (obj[k] !== null && obj[k] !== undefined) {
                        target[k] = obj[k];
                    }
                }
            }
        }
        return target;
    };

    /**
     * 打印日志信息
     * @method log
     * @param args {...} 多个参数
     */
    util.log = function() {
        if (window.domjs.debug) {
            for (var i in arguments) {
                console.log(JSON.stringify(arguments[i]));
            }
        }
    };
    /**
     * 取url的参数，并可以指定默认值
     *
     * 示例：
     *
     * 1. query('id')，取url参数中的id的值
     * 2. query('id',10)，取url参数中的id的值，如果id为空值，就返回默认值10
     *
     * @method query
     * @param key {string} 参数名
     * @param defaultValue [可选] 默认值
     */
    util.query = function(key, defaultValue) {
        if (!util.query_args) {
            util.query_args = util.getUrlQuery();
        }
        var tmp = util.query_args[key];
        if (typeof tmp == 'undefined' || tmp === '') {
            return defaultValue;
        }
        return tmp;
    };
    /**
     * 权限一个串生成hash值
     * @param str
     * @returns {number}
     */
    util.hash = function(str) {
        var hash = 0,
            char;
        if (str.length === 0) return hash;
        for (var i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };
    /**
     * 计算表达式的值
     * @param fn
     * @returns {*}
     */
    util.eval = function(fn) {
        var Fn = Function; //一个变量指向Function，防止有些前端编译工具报错
        return new Fn('return ' + fn)();
    };
    /**
     * 是否是一个简单的对象
     * @method isPlainObject
     * @param value 目标对象
     * @returns {boolean}
     */
    util.isPlainObject = function(value) {
        return !!value && Object.prototype.toString.call(value) === '[object Object]';
    };

    /**
     * 是否有指定串开头
     *
     * 示例：
     *
     *     startWith('abcdedfs','ab')   输出 true
     *
     * @method startWith
     * @param str {string} 待检查的串
     * @param startString 指定串
     * @returns {boolean}
     */
    util.startWith = function(str, startString) {
        return (typeof str === 'string' && str.indexOf(startString) === 0);
    };
    /**
     * 使用正则表示式判断是否为数字格式
     *
     * @method isNumber
     * @param chars {string}待判断有串
     * @returns {boolean}
     */
    util.isNumber = function(chars) {
        var re = /^(-?\d+)(\.\d+)?/;
        return chars.match(re) !== null;
    };

    /**
     * 转向一个url，支持多个参数，第一个参数为url地址，后续为参数
     *
     * 示例：
     *
     *     gotoUrl('index.html','id',1) 跳转到 index.html?id=1
     *     gotoUrl('index.html?id=1','k','news','c','show') 跳转到 index.html?id=1&k=news&c=show
     *
     * @method gotoUrl
     * @param url {string} 要跳转的url地址
     * @param ... 多个自由参数，2个一组，第1个为参数名，第2个为值。
     */
    util.gotoUrl = function() {
        var url = '',
            i = 0;
        if (arguments.length > 0) {
            url = arguments[i];
        }
        if (url.indexOf('?') != -1) {
            url += '&';
        } else {
            url += '?';
        }
        for (i = 1; i < arguments.length - 1; i += 2) {
            url += arguments[i] + '=' + encodeURIComponent(arguments[i + 1]) + '&';
        }
        w.location.href = url;
    };



    /**
     * 取url的所有参数
     * @method getUrlQuery
     * @returns {object}
     */
    util.getUrlQuery = function() {
        var args = {};
        var query = w.location.search; //获取查询串
        if (query && query.length > 1) {
            query = query.substring(1);
            var pos = query.indexOf('#');
            if (pos != -1) {
                query = query.substring(0, pos);
            }
            var pairs = query.split("&");
            for (var i = 0; i < pairs.length; i++) {
                pos = pairs[i].indexOf('='); //查找name=value
                if (pos == -1) {
                    continue;
                }
                //如果没有找到就跳过
                var argname = pairs[i].substring(0, pos); //提取name
                if (!argname) {
                    continue;
                }
                var value = pairs[i].substring(pos + 1); //提取value
                if (!value) {
                    continue;
                }
                args[argname] = decodeURIComponent(value); //存为属性
            }
        }
        return args;
    };
    /**
     * 设置url的参数
     * @method setUrlQuery
     * @param qs {object} 一个包含keyvalue的对象
     */
    util.setUrlQuery = function(qs) {
        var search = '';
        for (var q in qs) {
            if (qs[q]) {
                search += q + '=' + encodeURIComponent(qs[q]) + '&';
            }
        }
        w.location.search = search;
    };
    
    /**
     * 计算表达式的值
     * @param fn
     * @returns {*}
     */
    util.eval = function(fn) {
        var Fn = Function; //一个变量指向Function，防止有些前端编译工具报错
        return new Fn('return ' + fn)();
    };

    /**
     * 增加一个class
     * @method setValue
     * @param ele {object} 要操作的对象
     * @param className {string} 要增加的class名称
     */
    util.addClass = function(ele, className) {
        if (ele.classList) {
            if (!ele.classList.contains(className)) {
                ele.classList.add(className);
            }
        } else {
            var css = ele.className;
            if (css) {
                var csss = css.split(' '),
                    exists = false;
                for (var i = 0; i < csss.length; i++) {
                    if (csss[i] == className) {
                        exists = true;
                    }
                }
                if (!exists) {
                    csss.push(className);
                }
                css = csss.join(' ');
            } else {
                css = className;
            }
            ele.className = css;
        }
    };
    /**
     * 删除一个class
     * @method setValue
     * @param ele {object} 要操作的对象
     * @param className {string} 要删除的class名称
     */
    util.removeClass = function(ele, className) {
        if (ele.classList) {
            if (ele.classList.contains(className)) {
                ele.classList.remove(className);
            }
        } else {
            var css = ele.className;
            if (css) {
                var csss = css.split(' ');
                css = '';
                for (var i = 0; i < csss.length; i++) {
                    if (csss[i] != className) {
                        css += csss[i];
                    }
                }
                ele.className = css;
            }
        }
    };

    /**
     * 选择器
     * @param  {string} q [css选择器]
     * @return {[type]}   [选择的内容]
     */
    util.querySelectorAll = function(q) {
        if (document.querySelectorAll) {
            return document.querySelectorAll(q);
        }
    };
    /**
     * 使用jQuery来兼容ie8以下
     */
    if (!document.querySelectorAll && jQuery) {
        util.querySelectorAll = function(q) {
            var item = jQuery(q),
                re = [];
            item.each(function(i, e) {
                re.push(e);
            });
            return re;
        }
    }
    /*
     * String ES5 extend
     */
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

})(window.domjs.util = {}, document, window);