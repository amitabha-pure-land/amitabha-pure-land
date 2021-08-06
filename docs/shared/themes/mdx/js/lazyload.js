/*!
 * An jQuery | zepto plugin for lazy loading images.
 * author -> jieyou
 * see https://github.com/jieyou/lazyload
 * use some tuupola's code https://github.com/tuupola/jquery_lazyload (BSD)
 * use component's throttle https://github.com/component/throttle (MIT)
 */
!function (a) { "function" == typeof define && define.amd ? define(["jquery"], a) : a(window.jQuery || window.Zepto) }(function (a) { function g() { } function h(a, b) { var e; return e = b._$container == d ? ("innerHeight" in c ? c.innerHeight : d.height()) + d.scrollTop() : b._$container.offset().top + b._$container.height(), e <= a.offset().top - b.threshold } function i(b, e) { var f; return f = e._$container == d ? d.width() + (a.fn.scrollLeft ? d.scrollLeft() : c.pageXOffset) : e._$container.offset().left + e._$container.width(), f <= b.offset().left - e.threshold } function j(a, b) { var c; return c = b._$container == d ? d.scrollTop() : b._$container.offset().top, c >= a.offset().top + b.threshold + a.height() } function k(b, e) { var f; return f = e._$container == d ? a.fn.scrollLeft ? d.scrollLeft() : c.pageXOffset : e._$container.offset().left, f >= b.offset().left + e.threshold + b.width() } function l(a, b) { var c = 0; a.each(function (d) { function g() { f.trigger("_lazyload_appear"), c = 0 } var f = a.eq(d); if (!(f.width() <= 0 && f.height() <= 0 || "none" === f.css("display"))) if (b.vertical_only) if (j(f, b)); else if (h(f, b)) { if (++c > b.failure_limit) return !1 } else g(); else if (j(f, b) || k(f, b)); else if (h(f, b) || i(f, b)) { if (++c > b.failure_limit) return !1 } else g() }) } function m(a) { return a.filter(function (b) { return !a.eq(b)._lazyload_loadStarted }) } function n(a, b) { function h() { f = 0, g = +new Date, e = a.apply(c, d), c = null, d = null } var c, d, e, f, g = 0; return function () { c = this, d = arguments; var a = new Date - g; return f || (a >= b ? h() : f = setTimeout(h, b - a)), e } } var f, c = window, d = a(c), e = { threshold: 0, failure_limit: 0, event: "scroll", effect: "show", effect_params: null, container: c, data_attribute: "original", data_srcset_attribute: "original-srcset", skip_invisible: !0, appear: g, load: g, vertical_only: !1, check_appear_throttle_time: 300, url_rewriter_fn: g, no_fake_img_loader: !1, placeholder_data_img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC", placeholder_real_img: "http://ditu.baidu.cn/yyfm/lazyload/0.0.1/img/placeholder.png" }; f = function () { var a = Object.prototype.toString; return function (b) { return a.call(b).replace("[object ", "").replace("]", "") } }(), a.fn.hasOwnProperty("lazyload") || (a.fn.lazyload = function (b) { var i, j, k, h = this; return a.isPlainObject(b) || (b = {}), a.each(e, function (g, h) { var i = f(b[g]); -1 != a.inArray(g, ["threshold", "failure_limit", "check_appear_throttle_time"]) ? "String" == i ? b[g] = parseInt(b[g], 10) : "Number" != i && (b[g] = h) : "container" == g ? (b._$container = b.hasOwnProperty(g) ? b[g] == c || b[g] == document ? d : a(b[g]) : d, delete b.container) : !e.hasOwnProperty(g) || b.hasOwnProperty(g) && i == f(e[g]) || (b[g] = h) }), i = "scroll" == b.event, k = 0 == b.check_appear_throttle_time ? l : n(l, b.check_appear_throttle_time), j = i || "scrollstart" == b.event || "scrollstop" == b.event, h.each(function (c) { var e = this, f = h.eq(c), i = f.attr("src"), k = f.attr("data-" + b.data_attribute), l = b.url_rewriter_fn == g ? k : b.url_rewriter_fn.call(e, f, k), n = f.attr("data-" + b.data_srcset_attribute), o = f.is("img"); return 1 == f._lazyload_loadStarted || i == l ? (f._lazyload_loadStarted = !0, h = m(h), void 0) : (f._lazyload_loadStarted = !1, o && !i && f.one("error", function () { f.attr("src", b.placeholder_real_img) }).attr("src", b.placeholder_data_img), f.one("_lazyload_appear", function () { function i() { d && f.hide(), o ? (n && f.attr("srcset", n), l && f.attr("src", l)) : f.css("background-image", 'url("' + l + '")'), d && f[b.effect].apply(f, c ? b.effect_params : []), h = m(h) } var d, c = a.isArray(b.effect_params); f._lazyload_loadStarted || (d = "show" != b.effect && a.fn[b.effect] && (!b.effect_params || c && 0 == b.effect_params.length), b.appear != g && b.appear.call(e, f, h.length, b), f._lazyload_loadStarted = !0, b.no_fake_img_loader || n ? (b.load != g && f.one("load", function () { b.load.call(e, f, h.length, b) }), i()) : a("<img />").one("load", function () { i(), b.load != g && b.load.call(e, f, h.length, b) }).attr("src", l)) }), j || f.on(b.event, function () { f._lazyload_loadStarted || f.trigger("_lazyload_appear") }), void 0) }), j && b._$container.on(b.event, function () { k(h, b) }), d.on("resize load", function () { k(h, b) }), a(function () { k(h, b) }), this }) });

//平台相关的页面，不提供分享、收藏
var ids = ['58', '624', '686', '696', '1220', '1663', '2030', '2036', '2406', '3536', '3670', '4207', '4214', '4251', '4363', '4321', '4274', '3876','4423','4458','4462','4465'];

if (window.location.href.indexOf('/archives/category/') > 0) {
    //移除图片
    /*
    $('#postlist img').remove();
    $('div.mdui-card-primary-title').css('color', 'black');
    $('div.mdui-card-media').css('min-height', '80px');
    $('div.mdui-card-media').css('padding-top', '21px');
    $('#postlist .ct1').css('background-color', 'white');*/
}

$('.xcx').hide();
$('.notxcx').hide();

function getId() {
    var url = window.location.href;
    var start = url.lastIndexOf('/');
    if (start > 0) {
        var temp = url.substring(start + 1);
        start = temp.indexOf('?');
        if (start > 0) {
            temp = temp.substr(0, start);
        }
        return temp;
    }
}

function jiucuo() {
    tip('纠错', '请关注官方微信公众号后直接留言，或者发送邮件到fofalife@qq.com，感恩、合十，阿弥陀佛。');
}

function fav() {
    var mobile = getString(sessionStorage.getItem('user-mobile'));
    var url = window.location.href;

    if (mobile == '') {
        toast('请登录后再试');
    }
    else {
        if (url.indexOf('?') > 0) {
            url = url.substring(0, url.indexOf('?'));
        }

        mask();
        $.ajax({
            url: 'https://www.xuefovip.com/webservice/xcx.asmx/Action?version=999&sid=20161208&token=900521&uuid=uuid&action=CommonAction&keyword=网页收藏&username=' + mobile + '&postData=' + encodeURIComponent(url),
            type: "post",
            dataType: 'text',
            cache: false,
            success: function (data) {
                unmask();
                tip('提示', data);
            },
            error: function (e) {
                unmask();
                tip('提示','系统错误，请稍后重试。如果一直失败，请联系管理员。');
                //tip(e.responseText);
            }
        });
    }
}

function getParamValue(name, defaultValue) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null)
        return getString((r[2]));
    if (defaultValue) {
        return defaultValue; //返回参数值
    }
    else {
        return '';
    }
}

function getString(input) {
    if (input == undefined || input == null || input == "" || input == "null" || input == ' ' || input == 'undefined')
        return "";
    else
        return input.toString().trim();
}

function includeJs(url,callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
    script.onload = script.onreadystatechange = function () {
        if (script.readyState && script.readyState != 'loaded' && script.readyState != 'complete') return;
        script.onreadystatechange = script.onload = null;
        if (callback) {
            callback();
        }
    }
}

function openXCXPage(page) {
    if (window.__wxjs_environment === 'miniprogram') {
        wx.miniProgram.navigateTo({ url: page });
    }
    else {
        alert('请在小程序中打开');
    }    
}

function tip(title, msg, callback, confirmText) {
    var msg = replaceAll(msg, '\\n', '<br/>');
    msg = replaceAll(msg, '\n', '<br/>');
    if (callback) {
        return mdui.alert(msg, title, callback, { confirmText: confirmText ? confirmText : '我知道了', modal: true, history: false });
    }
    else {
        return mdui.alert(msg, title, null, { confirmText: confirmText ? confirmText : '我知道了', modal: true, history: false });
    }
}

function myalert(msg) {
    tip('提示',msg);
}

function viewImages(urls) {
    if (urls.indexOf(',') > 0) {
        var arr = urls.split(',');
        if (window.__wxjs_environment === 'miniprogram') {
            wx.previewImage({
                current: arr[0],
                urls: arr 
            });
        }
        else {
            tip('提示','请用微信打开后重试');
        }
    }
    else {
        var arr = [];
        arr.push(urls);
        if (window.__wxjs_environment === 'miniprogram') {
            wx.previewImage({
                current: arr[0],
                urls: arr 
            });
        }
        else {
            window.location.href = urls;
        }
    }
}

function  replaceAll (str, sptr, sptr1) {
    while (str.indexOf(sptr) >= 0) {
        str = str.replace(sptr, sptr1);
    }
    return str;
}

function toast(msg) {
    layer.open({
        content: msg
                  , skin: 'msg'
                  , time: 4 //4秒后自动关闭
    });
}

function mask(msg) {
    layer.open({
        type: 2,
        shadeClose: false,
        content: msg
    });
}

function unmask() {
    layer.closeAll();
}

function array_contain(array, obj) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == obj)
            return true;
    }
    return false;
}