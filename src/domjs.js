/**
 * domjs 常用功能，适用于微信和app开发
 *
 * css选择器说明：
 *
 *     .class    .intro    选择 class="intro" 的所有元素。
 *     #id    #firstname    选择 id="firstname" 的所有元素。
 *     %name  %firstname    选择 name="firstname"的所有元素。
 *     *    *    选择所有元素。
 *     element    p    选择所有 <p> 元素。
 *     element,element    div,p    选择所有 <div> 元素和所有 <p> 元素。
 *     element element    div p    选择 <div> 元素内部的所有 <p> 元素。
 *     element>element    div>p    选择父元素为 <div> 元素的所有 <p> 元素。
 *     element+element    div+p    选择紧接在 <div> 元素之后的所有 <p> 元素。
 *     [attribute]    [target]    选择带有 target 属性所有元素。
 *     [attribute=value]    [target=_blank]    选择 target="_blank" 的所有元素。
 *     [attribute~=value]    [title~=flower]    选择 title 属性包含单词 "flower" 的所有元素。
 *     [attribute|=value]    [lang|=en]    选择 lang 属性值以 "en" 开头的所有元素。
 *     :link    a:link    选择所有未被访问的链接。
 *     :visited    a:visited    选择所有已被访问的链接。
 *     :active    a:active    选择活动链接。
 *     :hover    a:hover    选择鼠标指针位于其上的链接。
 *     :focus    input:focus    选择获得焦点的 input 元素。
 *     :first-letter    p:first-letter    选择每个 <p> 元素的首字母。
 *     :first-line    p:first-line    选择每个 <p> 元素的首行。
 *     :first-child    p:first-child    选择属于父元素的第一个子元素的每个 <p> 元素。
 *     :before    p:before    在每个 <p> 元素的内容之前插入内容。
 *     :after    p:after    在每个 <p> 元素的内容之后插入内容。
 *     :lang(language)    p:lang(it)    选择带有以 "it" 开头的 lang 属性值的每个 <p> 元素。
 *     element~element    p~ul    选择前面有 <p> 元素的每个 <ul> 元素。
 *     [attribute^=value]    a[src^="https"]    选择其 src 属性值以 "https" 开头的每个 <a> 元素。*
 *     [attribute$=value]    a[src$=".pdf"]    选择其 src 属性以 ".pdf" 结尾的所有 <a> 元素。
 *     [attribute*=value]    a[src*="abc"]    选择其 src 属性中包含 "abc" 子串的每个 <a> 元素。*
 *     :first-of-type    p:first-of-type    选择属于其父元素的首个 <p> 元素的每个 <p> 元素。
 *     :last-of-type    p:last-of-type    选择属于其父元素的最后 <p> 元素的每个 <p> 元素。
 *     :only-of-type    p:only-of-type    选择属于其父元素唯一的 <p> 元素的每个 <p> 元素。
 *     :only-child    p:only-child    选择属于其父元素的唯一子元素的每个 <p> 元素。
 *     :nth-child(n)    p:nth-child()    选择属于其父元素的第二个子元素的每个 <p> 元素。
 *     :nth-last-child(n)    p:nth-last-child()    同上，从最后一个子元素开始计数。
 *     :nth-of-type(n)    p:nth-of-type()    选择属于其父元素第二个 <p> 元素的每个 <p> 元素。
 *     :nth-last-of-type(n)    p:nth-last-of-type()    同上，但是从最后一个子元素开始计数。
 *     :last-child    p:last-child    选择属于其父元素最后一个子元素每个 <p> 元素。
 *     :root    :root    选择文档的根元素。
 *     :empty    p:empty    选择没有子元素的每个 <p> 元素（包括文本节点）。
 *     :target    #news:target    选择当前活动的 #news 元素。
 *     :enabled    input:enabled    选择每个启用的 <input> 元素。
 *     :disabled    input:disabled    选择每个禁用的 <input> 元素
 *     :checked    input:checked    选择每个被选中的 <input> 元素。
 *     :not(selector)    :not(p)    选择非 <p> 元素的每个元素。
 *     ::selection    ::selection    选择被用户选取的元素部分。
 *
 * @class domjs
 */
(function(dj, document, undefined) {
    'use strict';
    //是否已初始化
    dj.isInit = false;
    /**
     * @property  是否是调试状态
     * @default false
     * @type {boolean}
     */
    dj.debug = false;
    /**
     * @property  是否禁止显示错误信息，只针对系统自动产生的错误，如http提交时。
     * @default false
     * @type {boolean}
     */
    dj.disableError = false;
    /**
     * ajax功能选项，可以使用jQuery替换。dj.ajax只支持一个ajax()方法。
     *
     * @property optAjax
     * @type {Object}
     * @default dj.ajax
     */
    dj.optAjax = typeof jQuery != 'undefined' ? jQuery : false;
    /**
     * 站点根路径，通常上传的图片使用这个值
     * @property root
     * @type {string}
     * @default ''
     */
    dj.root = '';
    /**
     * api请求的根路径，api请求可以缩短路径拼写。
     * 默认的http请求在url前都会加上这个路径，root+apiroot为完整的起始路径
     * @property apiroot
     * @type {string}
     * @default ''
     */
    dj.apiroot = '';
    /**
     * 需要执行的初始化函数，内部用
     * @type {Array}
     */
    dj.initFunction = [];
    /**
     * 多个待执行函数
     * @type {Array}
     */
    dj.readyFunction = [];


    /**
     * 动画绑定属性，只在绑定列表时有效
     * @property animationBind
     * @type {boolean}
     * @default false
     */
    dj.animationBind = false;
    /**
     * 是否使用jsonp方式请求数据
     * @property enableJsonp
     * @type {boolean}
     * @default false
     */
    dj.enableJsonp = false;
    /**
     * 动画绑定属性最小值，与animationBind联合使用，只有在列表大于最小值时才执行动画
     * @property animationBindMin
     * @type {number}
     * @default 5
     */
    dj.animationBindMin = 5;
    /**
     * 是否将要进行绑定的内容进行隐藏，以便在没有数据时隐藏模板。
     * @property hideBind
     * @type {boolean}
     * @default true
     */
    dj.hideBind = true;
    /**
     * 是否绑定domjs本身
     * @property bindApp
     * @type {boolean}
     * @default true
     */
    dj.bindSelf = true;
    /**
     * 窗口准备完毕，可以开始加载数据
     */
    dj.init = function() {
        if (dj.isInit) {
            return;
        }else{
            dj.isInit = true;
        }
        if (!dj.debug) {
            // 禁止右键菜单
            document.oncontextmenu = function() {
                return false;
            };
        }
        //执行初始化函数

        for (var i = 0; i < dj.initFunction.length; i++) {
            dj.initFunction[i](dj);
        }
        //绑定app基础数据
        if (dj.bindSelf) {
            dj.bindData('domjs', dj);
        }
        var exec = function(af) {
            if (!af.executed) {
                af.executed = true;
                setTimeout(function() {
                    af.callback();
                }, 1);
            }
        };
        for (var j = 0; j < dj.readyFunction.length; j++) {
            exec(dj.readyFunction[j]);
        }
    };
    /**
     * 窗口准备好后要执行的内容，常用于调用数据。
     *
     * 示例：
     *
     *     dj.ready(function()){
     *         alert('可以加载数据了');
     *     }
     *
     * @method ready
     * @param {Object} callback 回调函数
     */
    dj.ready = function(callback) {
        if (typeof callback != 'function') {
            return;
        }
        var rf = { executed: false, callback: callback };
        if (dj.isInit) {
            rf.callback();
            rf.executed = true;
        }
        dj.readyFunction.push(rf);
    };

    var testReady = function() {
        if (/complete|loaded|interactive/.test(document.readyState) && document.body) {
            dj.init();
            return true;
        }
        return false;
    };
    var timeReady = function() {
        if (!testReady()) {
            setTimeout(timeReady, 5);
        }
    };
    //开始初始化将执行ready方法
    if (!testReady()) {
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function() {
                testReady();
            }, false);
        } else {
            setTimeout(timeReady, 5);
        }
    }
})(window.domjs = {}, document);