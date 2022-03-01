/**
 * randomString
 * 生成一个不重复的字符串，如果重复就会造成死循环
 * @parpm length 随机字符串的长度
 */
export var randomString = (function () {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '_'];
    var charsArray = [];
    var generator = function (length) {
        var arr = new Array(length || 12).join('.').split('.');
        var result = arr.map(function () { return (chars[Math.floor(Math.random() * chars.length)][Math.random() > 0.5 ? 'toLocaleLowerCase' : 'toLocaleUpperCase']()); }).join('');
        if (charsArray.indexOf(result) >= 0) {
            return generator(length);
        }
        charsArray.push(result);
        return charsArray[charsArray.length - 1];
    };
    return function (length) { return (generator(length)); };
})();
// 注册ios jsbridge回调函数
// 接收一个回调函数，用于接收jsbridge实例
export var setupWebViewJavascriptBridge = function (callback) {
    var fallback = callback instanceof Function ? callback : function () { };
    var _window = (window.self === window.top ? window.self : window.top);
    if (_window.WebViewJavascriptBridge) {
        fallback(_window.WebViewJavascriptBridge);
        return;
    }
    if (_window.WVJBCallbacks) {
        _window.WVJBCallbacks.push(fallback);
        return;
    }
    _window.WVJBCallbacks = [fallback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () { document.documentElement.removeChild(WVJBIframe); }, 0);
};
// 用于挂载额外脚本
export var mountScript = (function () {
    var idArray = [];
    return function (url, callback) {
        if (!url || typeof url !== 'string') {
            if (callback instanceof Function) {
                callback(Error('mount script error: arguments url is undefined.'));
            }
            return;
        }
        // 处理已经加载过的脚本
        if (idArray.map(function (_a) {
            var url = _a.url;
            return (url);
        }).indexOf(url) >= 0) {
            if (callback instanceof Function) {
                callback();
            }
            return;
        }
        // 加载一个脚本
        var id = randomString(6);
        var $script = document.createElement('script');
        $script.src = url;
        $script.id = id;
        $script.addEventListener('load', function () {
            if (callback instanceof Function) {
                callback();
            }
            idArray.push({
                id: id,
                url: url,
            });
        });
        $script.addEventListener('error', function () {
            if (callback instanceof Function) {
                callback(Error('mount script error: load error.'));
            }
            document.body.removeChild($script);
        });
        document.body.appendChild($script);
    };
})();
//# sourceMappingURL=utils.js.map