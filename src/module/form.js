/**
 * 处理表单内容，用于数据传送
 * @class app.form
 */
(function (dj, service, va, util, undefined) {

    /**
     * 表单项

     *
     * @param name 表单项名
     * @constructor
     */
    function FormItem(name) {
        /**
         * 表单项名称
         */
        this.name = name;
        /**
         * 值
         * @type {Array}
         */
        this.values = [];
        /**
         * 验证规则
         */
        this.validateRule = {};
        /**
         * 验证串
         * @type {string}
         */
        this.dataMessage = '';

    }

    /**
     * 返回表单项的值
     *
     * @returns {*}
     */
    FormItem.prototype.getValue = function () {
        if (this.values.length === 1) {
            return this.values[0];
        } else if (this.values.length === 0) {
            return '';
        } else {
            return this.values;
        }
    };
    /**
     * 验证表单项
     *
     * @returns {boolean|string}
     */
    FormItem.prototype.noValidate = function () {
        if (va) {
            var re = va.validate(this.validateRule, this.values);
            if (typeof re === 'string') {
                return re;
            } else if (!re) {
                return this.dataMessage;
            }
        }
        this.clearError();
        return false;
    };
    /**
     * 显示一个错误提示
     */
    FormItem.prototype.showError = function (msg) {
        var chk = this.item;
        if (service.errorHtml !== '') {
            var errId = chk.name + '_error';
            var errObj = document.getElementById(errId);
            if (errObj) {
                errObj.innerHTML = msg;
            } else {
                var ele = document.createElement("span");
                ele.innerHTML = service.errorHtml;
                ele.children[0].innerHTML = msg;
                ele.children[0].id = errId;
                ele.children[0].name = errId;
                ele = ele.children[0];
                util.insertAfter(ele, chk);
            }
        }
        if (typeof chk.focus === 'function') {
            chk.focus();
        }
        if (chk.attributes['error-to-parent'] && chk.parentElement) {
            chk = chk.parentElement;
        }
        util.addClass(chk, 'has-error');
    };
    /**
     * 显示一个错误提示
     */
    FormItem.prototype.clearError = function (msg) {
        var chk = this.item;
        if (service.errorHtml !== '') {
            var errId = chk.name + '_error';
            var errObj = document.getElementById(errId);
            if (errObj) {
                errObj.innerHTML = '';
            }
        }
        if (chk.attributes['error-to-parent'] && chk.parentElement) {
            chk = chk.parentElement;
        }
        util.removeClass(chk, 'has-error');
    };
    /**
     * 根据指定元素的名称或是id选取值
     * @method val
     * @param selector {string} 目标的id值或是名称，如果是id，需要在id前加#
     * @param valid {boolean} 是否执行验证，默认为false
     * @return {Array|string|undefined} 如果执行了验证，在验证不通过时会返回undefined
     */
    service.val = function (selector, valid) {
        if (typeof selector !== 'string' || selector === '') {
            return;
        }
        var items;
        if (selector.substr(0, 1) === '#') {
            selector = selector.substr(1);
            items = [];
            var item = document.getElementById(selector);
            if (item) {
                items.push(item);
            }
        } else {
            items = document.getElementsByName(selector);
        }
        if (!items || items.length === 0) {
            return;
        }
        var values = this.getItemsValue(items);
        for (var k in values) {
            var value = values[k], msg;
            if (valid === true) {
                if ((msg = value.noValidate()) === false) {
                    return value.getValue();
                } else {
                    if (msg && service.isAlertError) {
                        dj.error(msg);
                    }
                    value.showError(msg);
                    return undefined;//返回验证失败
                }
            } else {
                return value.getValue();
            }
        }
    };
    /**
     * 取一组表单项的值
     * @param items
     * @returns {object}
     */
    service.getItemsValue = function (items) {
        var forms = {}, item;
        for (var i = 0; i < items.length; i++) {
            item = items[i];
            if (!item.disabled && item.name) {
                var formitem;
                if (!forms[item.name]) {
                    formitem = new FormItem(item.name);
                    formitem.item = item;
                    forms[item.name] = formitem;
                } else {
                    formitem = forms[item.name];
                }
                if (item.tagName === 'INPUT') {//如果input内容，前提是非disabled，取value
                    if (item.type === 'radio' || item.type === 'checkbox') {
                        if (item.checked) {
                            formitem.values.push(item.value);
                        }
                    } else {
                        formitem.values.push(item.value);
                    }
                } else if (item.tagName === 'SELECT') {
                    if (item.selectedIndex >= 0 && item.options[item.selectedIndex].value) {
                        formitem.values.push(item.options[item.selectedIndex].value);
                    }
                } else {
                    formitem.values.push(item.value);
                }
                //取验证规则
                if (item.attributes.hasOwnProperty('data-message')) {
                    if (item.attributes['data-message'].value !== '') {
                        formitem.dataMessage = item.attributes['data-message'].value;
                    }
                } else {
                    if (item.attributes.hasOwnProperty('placeholder') && item.attributes.placeholder.value !== '') {
                        formitem.dataMessage = item.attributes.placeholder.value;
                    } else if (item.attributes.hasOwnProperty('data-placeholder') && item.attributes['data-placeholder'].value !== '') {
                        formitem.dataMessage = item.attributes['data-placeholder'].value;
                    }
                }
                //required,pattern
                if (item.attributes.hasOwnProperty('required')) {
                    if (item.attributes.required.value === '') {
                        formitem.validateRule.required = formitem.dataMessage;
                    } else {
                        formitem.validateRule.required = item.attributes.required.value;
                    }
                    formitem.validateRule.hasRule = true;
                }
                //confirm
                if (item.attributes.hasOwnProperty('confirm')) {
                    formitem.validateRule.confirm = service.val(item.attributes.confirm.value);
                    formitem.validateRule.hasRule = true;
                }


                if (item.attributes.hasOwnProperty('pattern') && item.attributes.pattern.value !== '') {
                    formitem.validateRule.pattern = item.attributes.pattern.value;
                    formitem.validateRule.hasRule = true;
                } else if (item.attributes.hasOwnProperty('data-validate')) {
                    formitem.validateRule['data-validate'] = item.attributes['data-validate'].value;
                    formitem.validateRule.hasRule = true;
                } else {
                    //date	定义日期字段（带有 calendar 控件）
                    //datetime	定义日期字段（带有 calendar 和 time 控件）
                    //month	定义日期字段的月（带有 calendar 控件）
                    //week	定义日期字段的周（带有 calendar 控件）
                    //time	定义日期字段的时、分、秒（带有 time 控件）
                    //email	定义用于 e-mail 地址的文本字段
                    //                number	定义带有 spinner 控件的数字字段
                    //tel	定义用于电话号码的文本字段。
                    //url  定义用于 URL 的文本字段
                    if (item.tagName === 'INPUT') {
                        switch (item.type) {
                            case 'date':
                            case 'datetime':
                            case 'month':
                            case 'week':
                            case 'time':
                            case 'email':
                            case 'number':
                            case 'tel':
                            case 'url':
                                formitem.validateRule[item.type] = '';
                                formitem.validateRule.hasRule = true;
                                break;
                        }
                    }
                }

            }
        }
        return forms;
    };

    /**
     * 检查表单项
     * @method check
     * @param name {string|array|object} 表单的id或是表单元素名称的数组或是表单本身(this)
     * @return {boolean} 是否通过验证
     *
     * @example
     * app.form.check(this)
     **/
    service.check = function (name) {
        return service.getFormParam(name, true) !== undefined;
    };
    /**
     * 是否弹出错误信息
     * @property isAlertError
     * @type {boolean}
     * @default true
     */
    service.isAlertError = true;

    /**
     * 验证出错是追加到页面的html内容，追加到出错对象后面。
     * @property errorHtml
     * @type {string}
     */
    service.errorHtml = '';

    /**
     * 权限form的id取到form后，将表单内容转为参数，也可以将多个表单项一起取值
     * @method getFormParam
     * @param name {string|array|object} 表单的id或是表单元素名称的数组或是表单本身(this)
     * @param valid {boolean} 是否执行验证，默认为false
     * @return {Hash|undefined} 如果执行了验证，在验证不通过时会返回undefined
     */
    service.getFormParam = function (name, valid) {
        var param = {}, item, i = 0, v;
        if (util.isArray(name)) {//name的数组
            for (; i < name.length; i++) {
                v = this.val(name[i], valid);
                if (v === undefined) {
                    return;
                }
                param[name[i]] = v;
            }
            return param;
        }
        if (name === '') {
            return param;
        }
        //以下处理完整表单
        var form;
        if (typeof name === 'string') {
            form = document.getElementById(name);
        } else if (typeof name === 'object') {
            form = name;
        }
        if (!form) {
            return param;
        }
        var items = [];
        for (i = 0; i < form.length; i++) {
            items.push(form[i]);
        }
        var values = this.getItemsValue(items);
        for (var k in values) {
            var value = values[k], msg;
            if (valid === true) {
                if ((msg = value.noValidate()) === false) {
                    param[value.name] = value.getValue();
                } else {
                    if (msg && service.isAlertError) {
                        dj.error(msg);
                    }
                    value.showError(msg);
                    return undefined;//返回验证失败
                }
            } else {
                param[value.name] = value.getValue();
            }
        }
        return param;
    };
})(window.domjs, window.domjs.form = {}, window.domjs.validate, window.domjs.util);