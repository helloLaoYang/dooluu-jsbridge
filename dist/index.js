var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/**
 * @author aaron<aaron@codonas.cn>
 * @date 2021年02月19日16:01:23
 *
 * @description 适用于多鹿&多鹿老师
 *
 * @todo 每个api的version校验
 */
import dsbridge from 'dsbridge';
import pickBy from 'lodash/pickBy';
import { isVersionLessThan } from 'dooluu-common/utils';
import { JSBridge as JSBridgeOrigin } from 'dooluu-common/services/jsbridge';
import { randomString, setupWebViewJavascriptBridge } from './utils';
var instance;
var ua = navigator.userAgent.toLocaleLowerCase();
var device = ua.indexOf('android') >= 0 ? 'android' : 'ios';
var errorEvents = [];
var throwError = function (errorDescription) {
    if (errorDescription === void 0) { errorDescription = ''; }
    var error = Error('JSBridge Error'
        +
            '\n'
        + errorDescription);
    if (errorEvents && errorEvents.length) {
        errorEvents.forEach(function (fn) { return (fn instanceof Function && fn(error)); });
    }
    throw error;
};
var _a = [
    'dooluu',
    'micromessenger',
].filter(function (_) { return ua.indexOf(_) >= 0; })[0], browser = _a === void 0 ? window.__wxjs_environment === 'miniprogram' ? 'miniprogram' : 'unknown' : _a;
/**
 * 将函数转变为promise
 * @param fn 需要转变的函数
 * @example
 *
 *    const token = await promiseify(jsbridge.getUserTicket)()
 *
 *    await promiseify(jsbridge.chooseToast)('这是个提示语')
 *
 */
export var promiseify = function (fn) {
    if (!instance) {
        instance = new JSBridge();
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            try {
                args.push(resolve);
                instance.ready(function () {
                    fn.apply(instance, args);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    };
};
/**
 * callHandler
 * 主动调用jsbridge方法，为确保其成功，请在ready函数后调用
 * @param name {string} 调用的函数名
 * @param options {object} 调用该函数时的参数
 * @param callback {() => void} 调用成功的回调函数
 * @returns {any} 如果是同步函数，会立即返回结果
 *
 * @example
 *  const jsbridge = require('jsbridge')
 *
 *  // example1
 *  jsbridge.callHandler('Apiname')
 *
 *  // example2
 *  const response = jsbridge.callHandler('Apiname')
 *
 *  // example3
 *  const response = jsbridge.callHandler('Apiname', { somearguments: 'somearguments' })
 *
 *  // example4
 *  jsbridge.callHandler('Apiname', function (...arg) {
 *    // code
 *  })
 *
 *  //example5
 *  jsbridge.callHandler('Apiname', { somearguments: 'somearguments' }, function (...arg) {
 *    // code
 *  })
 */
var callHandler = function (name, options, callback) {
    // 回调函数参数兼容
    var fallback = options instanceof Function
        ? options
        : callback instanceof Function
            ? callback
            : function () { };
    var args = pickBy((options instanceof Function ? {} : options) || {});
    if (!this.$jsbridge) {
        fallback(undefined);
        return;
    }
    var returnResponse = this.$jsbridge[this.device === 'android'
        ? 'call'
        : 'callHandler'](name, (this.device === 'android' ? JSON.stringify(args) : args), function (response) {
        var result = response;
        try {
            result = typeof response === 'string'
                ? JSON.parse(response)
                : response;
        }
        catch (e) {
            // console.error(error)
        }
        fallback(result);
    });
    var returnResponseResult = returnResponse;
    try {
        returnResponseResult = typeof returnResponse === 'string'
            ? JSON.parse(returnResponse)
            : returnResponse;
    }
    catch (e) {
        // console.error(error)
    }
    return returnResponseResult;
};
/**
 * register
 * 注册监听函数，用于接收回调，为确保其成功，请在ready函数后调用
 * 仅在客户端下生效
 *
 * @param name {string} 注册的函数名
 * @param callback {any => void} 注册的回调函数，用于接受回调数据
 *
 * @example
 *  jsbridge.register('someEventListenerName', function (...arg) {
 *    // code
 *  })
 */
var register = function (name, callback) {
    if (!this.$jsbridge) {
        return;
    }
    var fallback = callback instanceof Function ? callback : function () { };
    this.$jsbridge[this.device === 'android'
        ? 'register'
        : 'registerHandler'](name, function (result) {
        console.log("register: " + name, result);
        try {
            var response = typeof result === 'string' ? JSON.parse(result) : result;
            fallback(response);
        }
        catch (error) {
            fallback(result);
        }
    });
};
var JSBridge = /** @class */ (function (_super) {
    __extends(JSBridge, _super);
    function JSBridge() {
        var _this = _super.call(this) || this;
        /**
         * 设备类型
         * 'android' | 'ios'
         */
        _this.device = device;
        /**
         * 浏览器类型
         * 'dooluu' | 'micromessenger' | 'miniprogram' | 'unknown
         */
        _this.browser = browser;
        /**
         * 网络类型
         * 'unknown' | 'wifi' | 'wwan' | 'none'
         */
        _this.networkType = 'unknown';
        /**
         * 客户端类型
         * 'c' | 'b'
         */
        _this.clientType = 'c';
        var self = _this;
        // ready
        _this.ready(function () {
            // 初始化windows
            self.status === self.$jsbridge ? 'READY' : 'NOTSUPPORT';
            window.DOOLUU_BRIDGE_CONTEXT = self;
            window.DOOLUU_BRIDGE = self.$jsbridge;
            window.DOOLUU_BRIDGE_CONTEXT.jsbridge = self.$jsbridge;
            self.getClientType(function (clientType) {
                self.clientType = clientType;
            });
            self.getNetworkType(function (networkType) {
                self.networkType = networkType;
            });
            self.getClientVersion(function (version) {
                self.version = version;
            });
        });
        return _this;
    }
    JSBridge.prototype._init = function (callback) {
        var _this = this;
        var fallback = callback instanceof Function ? callback : undefined;
        // 处理微信相关
        if (['micromessenger', 'miniprogram'].indexOf(this.browser) >= 0) {
            fallback && fallback();
            return;
        }
        // 多鹿客户端
        if (this.browser === 'dooluu') {
            if (this.$jsbridge) {
                fallback && fallback();
                return;
            }
            if (this.device === 'android') {
                this.$jsbridge = dsbridge;
                fallback && fallback();
                return;
            }
            if (this.device === 'ios') {
                setupWebViewJavascriptBridge(function (jsbridge) {
                    _this.$jsbridge = jsbridge;
                    fallback && fallback();
                });
                return;
            }
            fallback && fallback();
        }
        // 其他异常或者开发环境
        fallback && fallback();
    };
    /**
     * 监听多鹿客户端webview状态
     * @param {function} callback webview状态触发的回调函数
     *
     * @example
     * jsbridge.onLifecycle(function ({ status }) {
     *    // your code
     * })
     *
     */
    JSBridge.prototype.onLifecycle = function (callback) {
        if (callback instanceof Function) {
            register.call(this, 'onLifecycle', callback);
        }
    };
    /**
     * ready
     * 在ready函数后调用jsbridge, 用于保证jsbridge实例已经完全初始化
     * @param callback {() => void} 调用成功的回调函数
     * @returns Promsie<undefined>
     *
     * @example
     *  // example1
     *  jsbridge.ready(() => {
     *    // your code
     *  })
     *
     */
    JSBridge.prototype.ready = function (callback) {
        if (callback instanceof Function) {
            this._init(function () {
                callback();
            });
        }
    };
    /**
     *
     * @param callback
     */
    JSBridge.prototype.error = function (callback) {
        if (callback instanceof Function) {
            errorEvents.push(callback);
        }
    };
    /**
     * getUserTicket
     * 获取用户token
     * @param {functon} callback 获取用户token后的回调函数
     *
     * @example
     * jsbridge.getUserTicket(function (token) {
     *    if (!token) {
     *      return
     *    }
     *    // your code
     * })
     */
    JSBridge.prototype.getUserTicket = function (callback) {
        if (!(callback instanceof Function)) {
            throwError('getUserTicket arguments error: 缺乏回调函数或者回调函数格式不正确。');
            return;
        }
        if (this.device === 'android') {
            callback(callHandler.call(this, 'getUserTicket'));
            return;
        }
        callHandler.call(this, 'getUserTicket', callback);
    };
    /**
     * getClientType
     * 获取当前客户端类型 多鹿/多鹿老师App
     * 在微信中会被默认为c
     * @param {function} callback 成功获取客户端类型回调函数
     *
     * @example
     * jsbridge.getClientType(function (clientType) {
     *    // your code
     * })
     */
    JSBridge.prototype.getClientType = function (callback) {
        if (!(callback instanceof Function)) {
            throwError('getClientType arguments error: 缺乏回调函数或者回调函数格式不正确。');
            return;
        }
        var fallback = function (getClientType) { return callback((getClientType || 'c').toLocaleLowerCase()); };
        if (this.device === 'android') {
            fallback(callHandler.call(this, 'getUserType'));
            return;
        }
        callHandler.call(this, 'getUserType', fallback);
    };
    /**
     * 获取网络类型
     * 仅在多鹿客户端内有效，微信中表现为unknown
     * @params callback?: (networkType: 'unknown' | 'wifi' | 'wwan' | 'none') => void;
     *
     * @todo
     * 1. 添加从UA中获取的步骤
     *
     * @example
     * jsbridge.getNetworkType(function (networkType) {
     *    // your code
     * })
     */
    JSBridge.prototype.getNetworkType = function (callback) {
        if (!(callback instanceof Function)) {
            throwError('getNetworkType arguments error: 缺乏回调函数或者回调函数格式不正确。');
            return;
        }
        var fallback = function (networkType) { return callback((networkType || 'unknown').toLocaleLowerCase()); };
        if (this.device === 'android') {
            fallback(callHandler.call(this, 'getNetworkType'));
            return;
        }
        callHandler.call(this, 'getNetworkType', fallback);
    };
    /**
     * 获取客户端版本号
     * 仅在多鹿客户端内有效，微信中表现为为0.0.1
     * @param {function} callback 成功获取版本号的回调函数
     *
     * @example
     * jsbridge.getClientVersion(function (version) {
     *    // your code
     * })
     */
    JSBridge.prototype.getClientVersion = function (callback) {
        if (!(callback instanceof Function)) {
            throwError('getNetworkType arguments error: 缺乏回调函数或者回调函数格式不正确。');
            return;
        }
        if (this.device === 'android') {
            callback(callHandler.call(this, 'getClientVersion'));
            return;
        }
        callHandler.call(this, 'getClientVersion', callback);
    };
    /**
     *
     * @param options
     */
    JSBridge.prototype.getWebviewInfo = function (callback) {
        if (!(callback instanceof Function)) {
            throwError('getWebviewInfo arguments error: callback is error.');
            return;
        }
        var fallback = function (result) {
            if (typeof result === 'string') {
                callback(JSON.parse(result));
            }
            else {
                callback(result);
            }
        };
        if (this.device === 'android') {
            fallback(callHandler.call(this, 'getWebviewInfo'));
            return;
        }
        callHandler.call(this, 'getWebviewInfo', fallback);
    };
    /**
     * closeView
     * 关闭当前webview
     * @param {object} options
     * @options {string} redirectUrl 关闭webview后的重定向地址
     *
     * @example
     * jsbridge.closeView()
     *
     * jsbridge.closeView({
     *    redirectUrl: 'redirectUrl',
     * })
     */
    JSBridge.prototype.closeView = function (options) {
        var redirectUrl = (options || {}).redirectUrl;
        callHandler.call(this, 'closeView', redirectUrl ? {
            redirectUrl: redirectUrl,
        } : {});
    };
    /**
     * openView
     * 打开一个新的webview
     * @param {object} options
     * @options {string} url 新的webview链接
     * @param {function} callback 关闭回到当前webview时触发callback
     *
     * @example
     * jsbridge.openView({
     *    url: 'url',
     * })
     *
     * jsbridge.openView({
     *    url: 'url',
     * }, function () {
     *    // your code
     * })
     */
    JSBridge.prototype.openView = function (options, callback) {
        var url = (options || {}).url;
        var fallback = callback instanceof Function ? callback : function () { };
        if (!url || typeof url !== 'string') {
            throwError('openView arguments error: 参数url不存在或格式不正确.');
            return;
        }
        // 普通url
        if (url.indexOf('http') === 0) {
            var callbackName = randomString();
            register.call(this, callbackName, fallback);
            callHandler.call(this, 'openView', {
                callbackName: callbackName,
                url: url,
            });
            return;
        }
        if (callback instanceof Function) {
            console.warn('当前url为schema不支持回调函数');
        }
        // 普通的schema
        if ((this.device === 'ios' && !isVersionLessThan((this.version || '0.0.0'), '2.1.8'))
            ||
                (this.device === 'android' && !isVersionLessThan((this.version || '0.0.0'), '2.1.800'))) {
            callHandler.call(this, 'execScheme', {
                url: url,
            });
            return;
        }
        window.location.href = url;
    };
    /**
     * openLoading
     * 打开系统加载动画
     *
     * @example
     * jsbridge.openLoading()
     */
    JSBridge.prototype.openLoading = function () {
        callHandler.call(this, 'updateLoading', {
            show: true
        });
    };
    /**
     * closeLoading
     * 关闭系统加载动画
     *
     * * @example
     * jsbridge.closeLoading()
     */
    JSBridge.prototype.closeLoading = function () {
        callHandler.call(this, 'updateLoading', {
            show: false
        });
    };
    /**
     * chooseToast
     * 唤起系统toast
     * @param {object} options
     * @options {string} content 文案内容
     * @options {number} duration 显示文案的时长 单位秒, 注意：尽量不要使用
     *
     * @todo
     * duration 警告
     *
     * @example
     * jsbridge.chooseToast('这是提示文案')
     *
     * jsbridge.chooseToast({
     *    content: '这是提示文案',
     * })
     */
    JSBridge.prototype.chooseToast = function (options, callback) {
        if (['string', 'object'].indexOf(typeof options) < 0) {
            throwError('chooseToast arguments error: 参数格式不正确.');
            return;
        }
        callHandler.call(this, 'showToast', typeof options === 'string' ? { content: options } : options);
        callback instanceof Function && callback();
    };
    /**
     * useCustomizeAppbar
     * 设置透明&不占据webview空间的状态栏
     *
     * @param {boolean} useCustomizeAppbar 是否使用透明&不占据webview空间的状态栏
     *
     * @example
     * jsbridge.updateCustomizeAppbar()
     *
     * jsbridge.updateCustomizeAppbar(true)
     */
    JSBridge.prototype.updateCustomizeAppbar = function (useCustomizeAppbar, options) {
        if (useCustomizeAppbar) {
            var backText = (options || {}).title;
            callHandler.call(this, 'pageNeedCustomBar', {
                needed: true,
                fullscreen: true,
                color: '#00000000',
                backText: backText,
            });
            return;
        }
        callHandler.call(this, 'pageNeedCustomBar', {
            needed: false,
        });
    };
    /**
     * updateNavigatorButton
     * 更新左上角按钮
     * @param {string | string[]} options
     *
     * @example
     * jsbridge.updateNavigatorButton('BACK')
     *
     * jsbridge.updateNavigatorButton(['BACK'])
     *
     * jsbridge.updateNavigatorButton(['BACK', 'CLOSE'])
     */
    JSBridge.prototype.updateNavigatorButton = function (options) {
        if (typeof options === 'string' && ['CLOSE', 'BACK'].indexOf(options) < 0) {
            throwError('updateNavigatorButton arguments error: options 参数不正确');
            return;
        }
        var buttonList = (options instanceof Array
            ? options
            : [options]).filter(function (_) {
            return ['CLOSE', 'BACK'].indexOf(_) >= 0;
        });
        if (buttonList.length <= 0) {
            throwError('updateNavigatorButton arguments error: options 参数不正确');
            return;
        }
        callHandler.call(this, 'updateNavigatorButton', {
            buttonList: buttonList,
        });
    };
    /**
     * updateCanNavigateBack
     * 是否禁用返回按钮操作
     * @param {boolean} forbiddenNavBack 是否禁用webview返回按钮
     * @param {function} callback 用户点击返回按钮的回调函数
     *
     * @example
     * // 取消禁用
     * jsbridge.updateCanNavigateBack()
     *
     * // 禁用
     * jsbridge.updateCanNavigateBack(function () {
     *    // your code
     * })
     *
     * jsbridge.updateCanNavigateBack(true, function () {
     *    // your code
     * })
     */
    JSBridge.prototype.updateCanNavigateBack = function (forbiddenNavBack, callback) {
        if (forbiddenNavBack) {
            var fallback = forbiddenNavBack instanceof Function
                ? forbiddenNavBack
                : callback instanceof Function
                    ? callback
                    : undefined;
            var callbackName = randomString();
            if (fallback) {
                register.call(this, callbackName, fallback);
            }
            callHandler.call(this, 'updateCanNavigateBack', {
                forbiddenNavBack: true,
                callbackName: callbackName,
            });
            return;
        }
        callHandler.call(this, 'updateCanNavigateBack', {
            forbiddenNavBack: false,
        });
    };
    /**
     * 设置appbar右功能按钮
     * @param {object | array} options
     * @options {'TEXT' | 'BUTTON' | 'ICON'} type 按钮类型
     * @options {string} color 按钮文字，type为ICON时无效
     * @options {string} bgColor 按钮背景颜色，type为ICON时无效
     * @options {string} borderColor 按钮边框颜色
     * @options {string} icon 图片按钮链接，仅在type为ICON时生效
     * @options {string} transparentIcon 结合updateCustomizeAppbar使用时，图片按钮链接，仅在type为ICON时生效
     * @options {array} items 子按钮组合
     * @param {function} callback 点击按钮的回调函数
     *
     * @example
     * jsbridge.updateAppBarButton({
     *    // your arguments
     * }, function (result) {
     *    // your code
     * })
     *
     * jsbridge.updateAppBarButton([{
     *    // your arguments
     * }], function (result) {
     *    // your code
     * })
     *
     */
    JSBridge.prototype.updateAppBarButton = function (options, callback) {
        if (typeof options !== 'object') {
            throwError('updateAppBarButton arguments error: 参数格式不正确');
            return;
        }
        var callbackName = randomString();
        if (callback instanceof Function) {
            register.call(this, callbackName, callback);
        }
        if (options instanceof Array) {
            var buttonList = options.filter(function (_a) {
                var type = _a.type;
                return (['TEXT', 'BUTTON', 'ICON'].indexOf(type) >= 0);
            });
            if (buttonList.length <= 0) {
                throwError('updateAppBarButton arguments error: 参数不正确');
                return;
            }
            callHandler.call(this, 'updateAppBarButtonList', {
                show: true,
                callbackName: callbackName,
                buttonList: buttonList,
            });
            return;
        }
        if (['TEXT', 'BUTTON', 'ICON'].indexOf(options.type) < 0) {
            throwError('updateAppBarButton arguments error: 参数不正确');
            return;
        }
        callHandler.call(this, 'updateAppBarMenu', __assign(__assign({}, options), {
            show: true,
            callbackName: callbackName,
        }));
    };
    /**
     * 清除appbar右功能按钮
     *
     * @example
     *
     * jsbridge.clearAppBarButton()
     *
     */
    JSBridge.prototype.clearAppBarButton = function () {
        callHandler.call(this, 'updateAppBarButtonList', {
            show: false,
        });
        callHandler.call(this, 'updateAppBarMenu', {
            show: false,
        });
    };
    /**
     * chooseBgMusicSelector
     * 背景音乐选择器
     * @param {string} typeId 分类id，不传则从全部中选择
     *
     * @example
     * jsbridge.chooseBgMusicSelector(function (result) {
     *    // your code
     * })
     *
     * jsbridge.chooseBgMusicSelector({
     *    typeId: 'typeId',
     * }, function (result) {
     *  // your code
     * })
     */
    JSBridge.prototype.chooseBgMusicSelector = function (options, callback) {
        var fallback = options instanceof Function
            ? options
            : callback instanceof Function
                ? callback
                : undefined;
        var callbackName = randomString();
        if (fallback instanceof Function) {
            register.call(this, callbackName, fallback);
        }
        callHandler.call(this, 'openBgMusicView', typeof options === 'object' ? __assign(__assign({}, options), {
            callbackName: callbackName,
        }) : {
            callbackName: callbackName,
        });
    };
    /**
     * saveFilesToLocale
     * 保存文件到本地
     * @param {object} files 文件列表内容
     */
    JSBridge.prototype.saveFilesToLocale = function (options) {
        var self = this;
        var oriFiles = (options || {}).files;
        // 做入参兼容
        if (!oriFiles || !oriFiles.length) {
            throwError('saveFilesToLocale arguments error: files 参数不合法。');
            return;
        }
        var files = oriFiles.filter(function (_a) {
            var type = _a.type;
            return (['IMAGE', 'VIDEO'].indexOf(type) >= 0);
        });
        // 做入参兼容
        if (!files || !files.length) {
            throwError('saveFilesToLocale arguments error: files 参数不合法。');
            return;
        }
        // 新版本处理方案
        if ((this.device === 'ios' && !isVersionLessThan(this.version || '0.0.0', '2.1.4'))
            ||
                (this.device === 'android' && !isVersionLessThan(this.version || '0.0.0', '2.1.400'))) {
            callHandler.call(this, 'saveToLocale', {
                files: files,
            });
            return;
        }
        // 老版本使用方案
        var loopDownloadFiles = function (index) {
            if (index === void 0) { index = 0; }
            if (index >= files.length) {
                return;
            }
            self.callHandler('saveToLocale', {
                type: 'PICTURE',
                url: files[index].url,
            });
            setTimeout(function () {
                loopDownloadFiles(index + 1);
            }, 110);
        };
        loopDownloadFiles();
    };
    /**
     * 多媒体输入设备
     * @param options
     */
    JSBridge.prototype.chooseCaptureDevice = function (options, callback) {
        var callbackName = randomString();
        if (callback instanceof Function) {
            register.call(this, callbackName, callback);
        }
        callHandler.call(this, 'chooseCaptureDevice', __assign(__assign({
            bucket: 'common-static-resources',
            region: 'oss-cn-beijing',
            path: 'dooluu-devtool/files/'
        }, options), {
            callbackName: callbackName,
        }));
    };
    /**
     * chooseLocalMediaSelector
     * 打开本地多媒体资源选择器
     * *默认有bucket相关配置，如无必要可不修改存储相关配置
     * @param {string | undefined} bucket 文件存储空间名称
     * @param {string | undefined} path 文件存储路径
     * @param {string | undefined} region 存储空间区域
     * @param {number | undefined} count 可选择文件的的最大数量
     * @param {'IMAGE' | 'VIDEO'} accept 指定选择文件类型
     * @param {string[] | undefined} selected 已选择的文件
     * @param callback
     *
     * @example
     * jsbridge.chooseLocalMediaSelector({
     *    // your arguments
     * }, function (result) {
     *    // your code
     * })
     *
     * jsbridge.chooseLocalMediaSelector(function (result) {
     *    // your code
     * })
     */
    JSBridge.prototype.chooseLocalMediaSelector = function (options, callback) {
        var fallback = function (result) {
            if (options instanceof Function) {
                options(result);
            }
            if (callback instanceof Function) {
                callback(result);
            }
        };
        var callbackName = randomString();
        register.call(this, callbackName, fallback);
        callHandler.call(this, 'openSystemAlbumView', __assign(__assign({
            bucket: 'common-static-resources',
            region: 'oss-cn-beijing',
            path: 'dooluu-devtool/files/'
        }, options), {
            callbackName: callbackName
        }));
    };
    /**
     * 唤起云相册
     * chooseCloudMediaSelector
     */
    JSBridge.prototype.chooseCloudMediaSelector = function (options, callback) {
        if (typeof options !== 'object') {
            throwError('chooseCloudMediaSelector arguments error: arguments[0] not object.');
            return;
        }
        var babyId = options.babyId, gradeId = options.gradeId, media = options.accept, count = options.count, selected = options.selected;
        if (!babyId && !gradeId) {
            throwError('chooseCloudMediaSelector arguments error: target undefined.');
            return;
        }
        var callbackName = randomString();
        if (callback instanceof Function) {
            register.call(this, callbackName, callback);
        }
        callHandler.call(this, 'openAlbumView', __assign({
            media: media,
            selected: selected,
            count: count ? count : undefined,
            callbackName: callbackName,
        }, (babyId ? {
            target: 'BABY',
            targetId: babyId,
        }
            : {
                target: 'CLASS',
                targetId: gradeId,
            })));
    };
    /**
     * chooseMediaPreviewer
     * 打开多媒体文件播放器，目前不支持视频图片混合播放，所以取urls[0]['type']
     */
    JSBridge.prototype.chooseMediaPreviewer = function (options) {
        var _a = options.current, current = _a === void 0 ? 0 : _a, urls = options.urls;
        if (!(urls instanceof Array) || !urls.length) {
            throwError('chooseMediaPreviewer arguments error: urls is error');
            return;
        }
        var _b = urls[0].type, type = _b === void 0 ? 'IMAGE' : _b;
        callHandler.call(this, 'openMediaPreviewer', {
            current: current,
            urls: urls.map(function (_) { return (__assign(__assign({}, _), {
                type: options.type || type,
            })); }),
        });
    };
    /**
     * shareAppMessage
     * 分享普通信息到朋友/朋友圈/IM
     * @param {string} title 微信小卡片的标题
     * @param {string} desc 微信小卡片的描述。 *微信朋友圈设置了也不显示
     * @param {string} imgUrl 微信小卡片的图标地址
     * @param {'TIMELINE' | 'FRIEND' | 'IM'} target 指定分享对象，不指定则让用户选择
     * @param {'TIMELINE' | 'FRIEND' | 'IM'} menus 用户可选的分享对象，默认都显示
     *
     * @example
     * jsbridge.shareAppMessage()
     */
    JSBridge.prototype.shareAppMessage = function (options, callback) {
        var title = options.title, desc = options.desc, link = options.link, icon = options.imgUrl, shareType = options.shareType, shareMenus = options.shareMenus, bizType = options.bizType;
        var callbackName = randomString();
        if (callback instanceof Function) {
            console.warn('callback 需要多鹿/多鹿老师版本 > 2.1.700');
            register.call(this, callbackName, callback);
        }
        if (bizType) {
            console.warn('bizType 需要多鹿/多鹿老师版本 > 1.9.400');
        }
        callHandler.call(this, 'pullShare', {
            title: title,
            desc: desc,
            link: link || window.location.href,
            icon: icon,
            bizType: bizType,
            shareType: shareType,
            shareMenus: shareMenus instanceof Array ? shareMenus : ['TIMELINE', 'FRIEND', 'IM'],
            callbackName: callbackName,
        });
    };
    /**
     * shareImageFile
     * 分享图片到微信朋友/朋友圈/IM
     * @param {string} imgUrl 需要分享的图片地址
     * @param {'TIMELINE' | 'FRIEND' | 'IM'} target 指定分享对象，不指定则让用户选择
     * @param {'TIMELINE' | 'FRIEND' | 'IM'} menus 用户可选的分享对象，默认都显示
     *
     * @example
     * jsbridge.sharImageFile()
     */
    JSBridge.prototype.shareImageFile = function (options, callback) {
        var imgUrl = options.imgUrl, shareType = options.shareType, shareMenus = options.shareMenus;
        var callbackName = randomString();
        if (callback instanceof Function) {
            console.warn('callback 需要多鹿/多鹿老师版本 > 2.1.700');
            register.call(this, callbackName, callback);
        }
        callHandler.call(this, 'pullShare', {
            title: '多鹿',
            desc: '记录美好童年',
            link: 'http://dooluu.com.cn',
            imgUrl: imgUrl,
            shareType: shareType,
            shareMenus: shareMenus instanceof Array ? shareMenus : ['TIMELINE', 'FRIEND'],
            callbackName: callbackName,
        });
    };
    /**
     * shareMiniAppMessage
     * 分享微信小程序小卡片
     * @param {string} title 卡片名称
     * @param {string} desc 卡片描述
     * @param {string | undefined}  imgUrl 卡片海报封面
     * @param {string} link 小程序页面链接
     * @param {string} ghId 小程序原始id
     *
     * @example
     * jsbridge.shareMiniAppMessage({
     * })
     */
    JSBridge.prototype.shareMiniAppMessage = function (options, callback) {
        var title = options.title, desc = options.desc, link = options.link, icon = options.imgUrl, userName = options.ghId;
        var callbackName = randomString();
        if (callback instanceof Function) {
            console.warn('callback 需要多鹿/多鹿老师版本 > 2.1.700');
            register.call(this, callbackName, callback);
        }
        callHandler.call(this, 'pullShare', {
            shareType: 'MINIAPP',
            link: link,
            userName: userName,
            title: title,
            desc: desc,
            icon: icon,
            callbackName: callbackName,
        });
    };
    /**
     * sharePosterMessage
     * 分享海报，海报由服务端生成
     * @param {object} options
     * @options {string} bizType 业务类型
     * @options {string} targetId 业务类型对应的id
     * @options {string} bizContent 业务内容
     */
    JSBridge.prototype.sharePosterMessage = function (options) {
        var _a = typeof options === 'object' ? options : {
            bizType: undefined,
            targetId: undefined,
            bizContent: undefined,
        }, bizType = _a.bizType, targetId = _a.targetId, bizContent = _a.bizContent;
        // if(
        //   !(this.device === 'ios' && !isVersionLessThan(this.version!, '1.9.97'))
        //   ||
        //   !(device === 'android' && !isVersionLessThan(this.version!, '1.9.970'))
        // ) {
        //   return
        // }
        if (!targetId || typeof targetId !== 'string' || typeof targetId !== 'number') {
            throwError('sharePosterMessage arguments error: options.targetId is error.');
            return;
        }
        if (!bizType || typeof bizType !== 'string' || ['FEED', 'DOOLUU', 'PRODUCT', 'SHOP', 'LIVE'].indexOf(bizType) < 0) {
            throwError('sharePosterMessage arguments error: bizType is error.');
            return;
        }
        callHandler.call(this, 'chooseAppMessageShare', {
            bizType: bizType,
            targetId: targetId,
            bizContent: bizContent,
        });
    };
    /**
     * shareToFeed
     * @param options
     * @param callback
     */
    JSBridge.prototype.shareToFeed = function (options, callback) {
        if (typeof options !== 'object') {
            throwError('shareToFeed arguments error: options is undefined.');
            return;
        }
        var title = options.title, desc = options.desc, imgUrl = options.imgUrl, link = options.link, optionTarget = options.target, optionTargetId = options.targetId, targetGroups = options.targetGroups, bizType = options.bizType;
        var targetLegalList = this.clientType === 'c'
            ? ['BABY']
            : ['SCHOOL', 'GRADE', 'INSTITUTION'];
        var target = optionTarget && typeof optionTarget === 'string' && targetLegalList.indexOf(optionTarget) >= 0
            ? optionTarget
            : undefined;
        var targetId = target && optionTargetId
            ? optionTargetId
            : undefined;
        var callbackName = randomString();
        var groupKeys = target && targetId
            ? undefined
            : targetGroups
                ? targetGroups.filter(function (_) { return (targetLegalList.indexOf(_) >= 0); })
                : undefined;
        if (callback instanceof Function) {
            register.call(this, callbackName, callback);
        }
        callHandler.call(this, 'shareLinkToFeed', {
            title: title,
            desc: desc,
            cover: imgUrl,
            link: link || window.location.href,
            bizType: bizType,
            target: target,
            targetId: targetId,
            groupKeys: groupKeys && groupKeys.length ? groupKeys : undefined,
            callbackName: callbackName,
        });
    };
    /**
     * 唤起订单收银台
     *
     * @param {object} options
     * @options {string} orderNo 订单编号（交易单号）
     *
     * @param {function} 用户操作反馈
     *
     * @example
     * jsbridge.chooseCashier({
     *    orderNo: 'orderNo',
     * }, function (result) {
     *    // your code
     * }}
     */
    JSBridge.prototype.chooseCashier = function (options, callback) {
        var _a = typeof options === 'object' ? options : {
            orderNo: undefined,
            redirect: undefined,
        }, orderNo = _a.orderNo, redirect = _a.redirect;
        if (!orderNo || typeof orderNo !== 'string') {
            throwError('chooseCashier arguments error: options.orderNo is error.');
            return;
        }
        callHandler.call(this, 'chooseLocalPay', {
            orderNo: orderNo,
            redirect: redirect,
        }, function (result) {
            if (callback instanceof Function) {
                callback(result);
            }
        });
    };
    /**
     * choosePay
     * 唤起支付微信/支付宝/多鹿支付功能
     * @param {object} options
     * @options {string} orderNo 订单号（交易单号）
     * @options {string} channel 支付方式
     * @param {function} callback
     *
     * @example
     * jsbridge.choosePay({
     *    orderNo: 'orderNo',
     *    channel: 'channel',
     * }, function (result) {
     *    // your code
     * })
     */
    JSBridge.prototype.choosePay = function (options, callback) {
        var _a = typeof options === 'object' ? options : {
            orderNo: undefined,
            channel: undefined,
            redirect: undefined,
        }, orderNo = _a.orderNo, channel = _a.channel, redirect = _a.redirect;
        if (!orderNo || typeof orderNo !== 'string') {
            throwError('choosePay arguments error: options.orderNo is error.');
            return;
        }
        if (!channel || ['DOOLUU', 'ALIPAY', 'WECHAT'].indexOf(channel) < 0) {
            throwError('chooseCashier arguments error: options.channel is error.');
            return;
        }
        if (this.device !== 'ios' && channel === 'DOOLUU') {
            throwError('chooseCashier arguments error: 请勿在非IOS设备中使用鹿币支付。');
            return;
        }
        callHandler.call(this, 'choosePay', {
            orderNo: orderNo,
            channel: channel,
            redirect: redirect,
        }, function (result) {
            if (callback instanceof Function) {
                callback(result);
            }
        });
    };
    /**
     * copy2Clipboard
     * 复制图片到剪切板，辅助文案请使用js
     * @param {string} url 需要辅助的图片的url
     */
    JSBridge.prototype.copy2Clipboard = function (content) {
        if (!content || typeof content !== 'string') {
            throwError('copy2Clipboard error: content is error.');
            return;
        }
        callHandler.call(this, 'copy2Clipboard', {
            contentType: content.indexOf('http') >= 0 ? 'PICTURE' : 'TEXT',
            content: content,
        });
    };
    /**
     * chooseClipboardListener
     * 唤起链接识别监听器
     * @param {function} callback 识别到链接，并且点击确定后回调链接内容
     */
    JSBridge.prototype.chooseClipboardListener = function (callback) {
        var callbackName = randomString();
        if (callback instanceof Function) {
            register.call(this, callbackName, callback);
        }
        callHandler.call(this, 'chooseClipboardListener', {
            type: 'LINK',
            callbackName: callbackName,
        });
    };
    /**
     * chooseHpplay
     * 唤起投屏功能
     * IOS并不支持，请使用airplay
     * @param {function} callback 投屏/结束投屏后的回调，并且返回投屏状态
     */
    JSBridge.prototype.chooseHpplay = function (callback) {
        if (this.device === 'ios') {
            return;
        }
        callHandler.call(this, 'chooseHpplay', function (result) {
            if (!(callback instanceof Function)) {
                return;
            }
            callback(result);
        });
    };
    /**
     * 预览亲子打卡模板
     * previewPunchTemplate
     */
    JSBridge.prototype.choosePunchTemplatePreview = function (options) {
        callHandler.call(this, 'previewPunchTemplate', typeof options === 'object' ? options : undefined);
    };
    /**
     * 填充亲子打卡模板
     * fillPunchFromTemplate
     */
    JSBridge.prototype.fillPunchTemplate = function (options) {
        callHandler.call(this, 'fillPunchFromTemplate', typeof options === 'object' ? options : undefined);
    };
    /**
     * fillFromTemplate
     * 选择模板回填客户端
     * @param options
     */
    JSBridge.prototype.fillFromTemplate = function (options) {
        var _a = options || {}, _b = _a.type, type = _b === void 0 ? 'FEED' : _b, _c = _a.data, data = _c === void 0 ? JSON.stringify({}) : _c;
        if (type !== 'FEED') {
            throwError('fillFromTemplate arguments error: type的值不在可选范围。');
            return;
        }
        if (typeof data !== 'string') {
            throwError('fillFromTemplate arguments error: data必须是一个json字符串。');
            return;
        }
        callHandler.call(this, 'fillFromTemplate', {
            type: type,
            data: data,
        });
    };
    /**
     * 成长相册预览页面打印按钮调用端弹框
     * growthAlbumPrint
     * @param options
     */
    JSBridge.prototype.choosegGrowthAlbumPrint = function (options) {
        var _a = options || {}, growthAlbumId = _a.growthAlbumId, spuId = _a.spuId;
        if (!growthAlbumId) {
            throwError('growthAlbumPrint arguments error: growthAlbumId is undefined.');
            return;
        }
        if (!spuId) {
            throwError('growthAlbumPrint arguments error: spuId is undefined.');
            return;
        }
        callHandler.call(this, 'growthAlbumPrint', {
            growthAlbumId: growthAlbumId,
            spuId: spuId,
        });
    };
    /**
     * 唤醒客户端相册一键提醒分享
     * growthAlbumRemind
     * @param {object} options
     * @options {string} growthAlbumId 成长册id
     * @options {termId} 学期id
     * @options {gradeId} gradeId 班级id
     */
    JSBridge.prototype.chooseGrowthAlbumRemind = function (options) {
        var _a = options || {}, growthAlbumId = _a.growthAlbumId, termId = _a.termId, gradeId = _a.gradeId;
        if (!growthAlbumId) {
            throwError('growthAlbumRemind arguments error: growthAlbumId is undefined.');
            return;
        }
        if (!termId) {
            throwError('growthAlbumRemind arguments error: termId is undefined.');
            return;
        }
        if (!gradeId) {
            throwError('growthAlbumRemind arguments error: gradeId is undefined.');
            return;
        }
        callHandler.call(this, 'growthAlbumRemind', {
            growthAlbumId: growthAlbumId,
            termId: termId,
            gradeId: gradeId,
        });
    };
    /**
     * chooseMap
     * 唤起底图
     * @param {object} options
     * @options {boolean} withMap 是否启用锚点功能
     * @options {boolean} associate 是否启用联想输入
     * @options {string} name 地址信息
     * @options {string} longitude 地址经纬度
     * @options {string} latitude
     */
    JSBridge.prototype.chooseMap = function (options, callback) {
        var _a = typeof options === 'object'
            ? options
            : {}, _b = _a.withMap, withMap = _b === void 0 ? false : _b, _c = _a.associate, associate = _c === void 0 ? undefined : _c, _d = _a.longitude, longitude = _d === void 0 ? undefined : _d, _e = _a.latitude, latitude = _e === void 0 ? undefined : _e, _f = _a.province, province = _f === void 0 ? undefined : _f, _g = _a.city, city = _g === void 0 ? undefined : _g, _h = _a.area, area = _h === void 0 ? undefined : _h, _j = _a.name, name = _j === void 0 ? undefined : _j, _k = _a.address, address = _k === void 0 ? undefined : _k;
        var fallback = callback instanceof Function
            ? callback
            : options instanceof Function
                ? options
                : undefined;
        var callbackName = randomString();
        if (fallback) {
            register.call(this, callbackName, fallback);
        }
        callHandler.call(this, 'chooseMapAddressSelecter', {
            withMap: withMap,
            associate: associate,
            longitude: longitude,
            latitude: latitude,
            province: province,
            area: area,
            city: city,
            name: name,
            address: address,
            callbackName: callbackName,
        });
    };
    return JSBridge;
}(JSBridgeOrigin));
export { JSBridge };
export default function () {
    if (!(instance instanceof JSBridge)) {
        instance = new JSBridge();
    }
    return instance;
}
//# sourceMappingURL=index.js.map