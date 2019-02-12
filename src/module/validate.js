/**
 * 字串验证类
 * 验证规则优先级
 *
 *     required，可以和任何规则一起一起使用
 *     pattern，使用后，除required外，其它都失效
 *     data-validate，当没有pattern时有效，使用后除required外，其它都失效
 *     基于input的type属性验证为最低级别
 *
 * 计划支持如下type
 *
 *     date
 *     datetime
 *     month
 *     week
 *     time
 *     email：邮件地址
 *     number
 *     tel：电话号码
 *     url：网址
 *
 * @class validate
 */
(function (v) {
    /**
     * 验证规则
     * @param rules {object} 规则集合
     * @param strs {Array}待验证的字符串数组
     * @return {boolean|string} 验证是否通过，如果返回字符串，说明是required单独定义的错误信息
     */
    v.validate = function (rules, strs) {
        if (!rules.hasRule) {
            return true;
        }
        var hasValue = false, i = 0;
        for (; i < strs.length; i++) {
            if (strs[i] !== '') {
                hasValue = true;
                break;
            }
        }

        if (!hasValue) {
            if (this.hasRequired(rules)) {
                if (rules.required !== '') {
                    return rules.required;
                } else if (rules.dataMessage !== '') {
                    return rules.dataMessage;
                } else {
                    return false;
                }
            }
        }
        if (hasValue) {
            for (var rule in  rules) {
                if (rule !== 'required') {//required已经验证过
                    if (!this.validateItem(rule, rules[rule], strs)) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    /**
     * 验证规则
     * @param rule {string}
     * @param ruleOption {string}
     * @param strs {Array}
     */
    v.validateItem = function (rule, ruleOption, strs) {
        for (var i = 0; i < strs.length; i++) {
            if (this.rule[rule] && !this.rule[rule](strs[i], ruleOption)) {
                return false;
            }
        }
        return true;
    };
    /**
     * 是否有required要求
     * @param rules {object} 规则集合
     */
    v.hasRequired = function (rules) {
        return rules.hasOwnProperty('required');
    };
    /**
     * 验证规则
     * @type {object}
     */
    v.rule = {};

    /**
     * 正则验证，使用本验证后，基本type的验证失效
     *
     * 示例：
     *
     *     <input type="text" pattern="/\d+/" >
     *
     *
     * @param str
     * @param rule
     * @returns {boolean}
     */
    v.rule.pattern = function (str, rule) {
        var reg = new RegExp(rule, 'g');
        return (reg.test(str));
    };
    //email
    /**
     * 验证email的地址
     *
     * 示例：
     *
     *     <input type="email" >
     *
     * @property rule.email
     * @param str {string} 待验证串
     * @returns {boolean}
     */
    v.rule.email = function (str) {
        return v.regex.email.test(str);
    };
    //url
    /**
     * 验证网址，这个是html自带的验证
     *
     * 示例：
     *
     *     <input type="url" >
     *
     * @property rule.url
     * @param str {string} 待验证串
     * @returns {boolean}
     */
    v.rule.url = function (str) {
        return v.regex.url.test(str);
    };

    /**
     * 电话验证
     * @param str
     * @returns {boolean}
     */
    v.rule.tel = function (str) {
        return v.regex.tel.test(str);
    };
    /**
     * 两个字段值相同难
     * @param str
     * @param rule
     * @returns {boolean}
     */
    v.rule.confirm = function (str, rule) {
        return str === rule;
    };
    /**
     * 扩展验证
     * 已支持
     *
     *     mobile：手机号验证
     *
     * 示例：
     *
     *     <input type="text" data-validate="mobile">
     *
     * @property  rule.data-validate
     * @param str 要验证的内容
     * @param rule 规则
     * @returns {boolean}
     */
    v.rule['data-validate'] = function (str, rule) {
        if (v.regex[rule]) {
            return v.regex[rule].test(str);
        }
        return true;
    };
    /**
     * 常用正则表达式
     */
    v.regex = {};
    //email
    v.regex.email = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    //手机
    v.regex.mobile = /^1[34578]+\d{9}$/;
    //网址
    v.regex.url = /[a-zA-z]+:\/\/[^\s]*/;
    //电话
    v.regex.tel = /\d+/;
    //date
    v.regex.date = /\d{4}-\d{1,2}-\d{1,2}/;
    //month
    v.regex.month = /(0?[1-9]|1[0-2])/;
    //day
    v.regex.day = /((0?[1-9])|((1|2)[0-9])|30|31)/;
    //domain
    v.regex.domain = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
    //id card
    v.regex.idcard = /(\d{18}|\d{15}|\d{17}x)/;
    //chinese word
    v.regex.chineseword = /[\u4e00-\u9fa5]/;

//    1 Email地址：^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$
//    2 域名：[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(/.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+/.?
//    3 InternetURL：[a-zA-z]+://[^\s]* 或 ^http://([\w-]+\.)+[\w-]+(/[\w-./?%&=]*)?$
//    4 手机号码：^1[34578]{1}\d{9}$
//    7 身份证号^(\d{18,18}|\d{15,15}|\d{17,17}x)$
//    12 日期格式：^\d{4}-\d{1,2}-\d{1,2}
//    13 一年的12个月(01～09和1～12)：^(0?[1-9]|1[0-2])$
//    14 一个月的31天(01～09和1～31)：^((0?[1-9])|((1|2)[0-9])|30|31)$
//    26 中文字符的正则表达式：[\u4e00-\u9fa5]
//    32 中国邮政编码：[1-9]\˚d{5}(?!\d)    (中国邮政编码为6位数字)
//    33 IP地址：\d+\.\d+\.\d+\.\d+    (提取IP地址时有用)
})(window.domjs.validate = {});