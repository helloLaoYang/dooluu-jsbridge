
/**
 * @author aaron<aaron@codonas.cn>
 * @date 2021年02月19日16:01:23
 * 
 * @description 适用于多鹿&多鹿老师
 * 
 * @todo 每个api的version校验
 */
import dsbridge from 'dsbridge'
import pickBy from 'lodash/pickBy'
import { isVersionLessThan } from 'dooluu-common/utils'
import { JSBridge as JSBridgeOrigin } from 'dooluu-common/services/jsbridge'
import { randomString, setupWebViewJavascriptBridge } from './utils'

let instance: JSBridge | undefined

const ua = navigator.userAgent.toLocaleLowerCase()
const device = ua.indexOf('android') >= 0 ? 'android' : 'ios'

const errorEvents: ((error: Error) => void)[] = []

const throwError = function (errorDescription = '') {
  const error = Error(
    'JSBridge Error'
    +
    '\n'
    + errorDescription
  )

  if (errorEvents && errorEvents.length) {
    errorEvents.forEach(fn => (
      fn instanceof Function && fn(error)
    ))
  }
  throw error
}

const [
  browser = window.__wxjs_environment === 'miniprogram' ? 'miniprogram' : 'unknown',
] = [
  'dooluu',
  'micromessenger',
].filter(_ => ua.indexOf(_) >= 0)

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
export const promiseify = function (fn: Function) {
  if (!instance) {
    instance = new JSBridge()
  }
  return (...args: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        args.push(resolve)
        instance!.ready(() => {
          fn.apply(instance, args)
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}

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
const callHandler = function (
  this: JSBridge,
  name: string,
  options?: { [key: string]: any } | ((result: any) => void),
  callback?: (result: any) => void
) {
  // 回调函数参数兼容
  const fallback = options instanceof Function
    ? options
    : callback instanceof Function
      ? callback
      : function () {}

  const args = pickBy(
    (options instanceof Function ? {} : options) || {},
  )

  if (!this.$jsbridge) {
    fallback(undefined)
    return
  }

  const returnResponse = this.$jsbridge[
    this.device === 'android'
      ? 'call'
      : 'callHandler'
    ](name, (
      this.device === 'android' ? JSON.stringify(args) : args
    ), (response: any) => {
      let result = response
      try {
        result = typeof response === 'string'
          ? JSON.parse(response)
          : response
      } catch (e) {
        // console.error(error)
      }
      fallback(result)
    })

  let returnResponseResult = returnResponse

  try {
    returnResponseResult = typeof returnResponse === 'string'
      ? JSON.parse(returnResponse)
      : returnResponse
  } catch (e) {
    // console.error(error)
  }

  return returnResponseResult
}

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
const register = function (
  this: JSBridge,
  name: string,
  callback: (result: any) => void,
) {
  if (!this.$jsbridge) {
    return
  }
  const fallback = callback instanceof Function ? callback : function () {}
  this.$jsbridge[
    this.device === 'android'
      ? 'register'
      : 'registerHandler'
    ](name, (result: any) => {
      console.log(`register: ${ name }`, result)
      try {
        const response = typeof result === 'string' ? JSON.parse(result) : result
        fallback(response)
      } catch (error) {
        fallback(result)
      }
    })
}


export class JSBridge extends JSBridgeOrigin {

  // 原生jsbridge
  $jsbridge: any;

  // 微信jssdk对象
  $wechat?: any;

  /**
   * 设备类型
   * 'android' | 'ios'
   */
  device: 'android' | 'ios' = device;

  /**
   * 浏览器类型
   * 'dooluu' | 'micromessenger' | 'miniprogram' | 'unknown
   */
  browser = browser as any;

  /**
   * 版本号
   * @string
   */
  version?: string;

  /**
   * 网络类型
   * 'unknown' | 'wifi' | 'wwan' | 'none'
   */
  networkType: 'unknown' | 'wifi' | 'wwan' | 'none' = 'unknown';

  /**
   * 客户端类型
   * 'c' | 'b'
   */
  clientType: 'c' | 'b' = 'c';

  constructor () {
    super()
    
    const self = this
    
    // ready
    this.ready(function () {

       // 初始化windows
      self.status === self.$jsbridge ? 'READY' : 'NOTSUPPORT'

      window.DOOLUU_BRIDGE_CONTEXT = self

      window.DOOLUU_BRIDGE = self.$jsbridge

      window.DOOLUU_BRIDGE_CONTEXT.jsbridge = self.$jsbridge

      self.getClientType(function (clientType) {
        self.clientType = clientType
      })
      self.getNetworkType(function (networkType) {
        self.networkType = networkType
      })
      self.getClientVersion(function (version) {
        self.version = version
      })
    })
  }

  _init (callback: () => void) {
    const fallback = callback instanceof Function ? callback : undefined

    // 处理微信相关
    if (['micromessenger', 'miniprogram'].indexOf(this.browser) >= 0) {
      fallback && fallback()
      return
    }

    // 多鹿客户端
    if (this.browser === 'dooluu') {

      if (this.$jsbridge) {
        fallback && fallback()
        return
      }
      if (this.device === 'android') {
        this.$jsbridge = dsbridge
        fallback && fallback()
        return
      }

      if (this.device === 'ios') {
        setupWebViewJavascriptBridge((jsbridge: any) => {
          this.$jsbridge = jsbridge
          fallback && fallback()
        })
        return
      }
      
      fallback && fallback()
    }

    // 其他异常或者开发环境
    fallback && fallback()
    
  }

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
  onLifecycle (callback: (
    result: { status: 'resume' | 'pause' | 'destroy' }
  ) => void) {
    if (callback instanceof Function) {
      register.call(this, 'onLifecycle', callback)
    }
  }

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
  ready (callback: () => void) {
    if (callback instanceof Function) {
      this._init(() => {
        callback()
      })
    }
  }

  /**
   * 
   * @param callback 
   */
  error (callback: (error: Error) => void) {
    if (callback instanceof Function) {
      errorEvents.push(callback)
    }
  }

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
  getUserTicket (callback: (token?: string)  => void) {
    
    
    if (!(callback instanceof Function)) {
      throwError('getUserTicket arguments error: 缺乏回调函数或者回调函数格式不正确。')
      return
    }

    if ( this.device === 'android') {

      callback(callHandler.call(this, 'getUserTicket'))
      return
    }
    callHandler.call(this, 'getUserTicket', callback)
  }

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
  getClientType (callback: (getClientType:  'c' | 'b') => void) {

    if (!(callback instanceof Function)) {
      throwError('getClientType arguments error: 缺乏回调函数或者回调函数格式不正确。')
      return
    }

    const fallback =  (getClientType: any) => callback((getClientType || 'c').toLocaleLowerCase())

    if (this.device === 'android') {
      fallback(callHandler.call(this, 'getUserType'))
      return
    }

    callHandler.call(this, 'getUserType', fallback)
  }

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
  getNetworkType (callback: (networkType: 'unknown' | 'wifi' | 'wwan' | 'none') => void) {

    if (!(callback instanceof Function)) {
      throwError('getNetworkType arguments error: 缺乏回调函数或者回调函数格式不正确。')
      return
    }

    const fallback = (networkType: any) => callback((networkType || 'unknown').toLocaleLowerCase())
 
    if (this.device === 'android') {
      fallback(callHandler.call(this, 'getNetworkType'))
      return
    }

    callHandler.call(this, 'getNetworkType', fallback)
  }

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
  getClientVersion (callback: (version: string) => void) {

    if (!(callback instanceof Function)) {
      throwError('getNetworkType arguments error: 缺乏回调函数或者回调函数格式不正确。')
      return
    }

    if (this.device === 'android') {
      callback(callHandler.call(this, 'getClientVersion'))
      return
    }

    callHandler.call(this, 'getClientVersion', callback)
  }

  /**
   * 
   * @param options 
   */
  getWebviewInfo (callback: (result: {
    x: number;
    y: number;
    width: number;
    height: number;
    parentPageId?: string;
    sessionId?: string;
    aId?: string;
    isFullScreen: boolean;
    clientVersion: string;
  }) => void) {
    if (!(callback instanceof Function)) {
      throwError('getWebviewInfo arguments error: callback is error.')
      return
    }

    const fallback = (result: any) => {
      if (typeof result === 'string') {
        callback(JSON.parse(result))
      } else {
        callback(result)
      }
    }

    if (this.device === 'android') {
      fallback(callHandler.call(this, 'getWebviewInfo'))
      return
    }
    callHandler.call(this, 'getWebviewInfo', fallback)
  }

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
  closeView (options?: {
    redirectUrl: string;
  }) {
    const { redirectUrl } = options || {}
    callHandler.call(this, 'closeView', redirectUrl ? {
      redirectUrl,
    } : {})
  }
   
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
  openView (
    options: {
      url: string;
    },
    callback?: () => void
  ) {

    const { url }= options || {}

    const fallback = callback instanceof Function ? callback : () => {}

    if (!url || typeof url !== 'string') {
      throwError('openView arguments error: 参数url不存在或格式不正确.')
      return
    }

    // 普通url
    if (url.indexOf('http') === 0) {
      const callbackName = randomString()
      register.call(this, callbackName, fallback)

      callHandler.call(this, 'openView', {
        callbackName,
        url,
      })
      return
    }

    if (callback instanceof Function) {
      console.warn('当前url为schema不支持回调函数')
    }

    // 普通的schema
    if (
      (this.device === 'ios' && !isVersionLessThan((this.version || '0.0.0'), '2.1.8'))
      ||
      (this.device === 'android' && !isVersionLessThan((this.version || '0.0.0'), '2.1.800'))
    ) {
      callHandler.call(this, 'execScheme', {
        url,
      })
      return
    }
    
    window.location.href = url
  }

  /**
   * openLoading
   * 打开系统加载动画
   * 
   * @example
   * jsbridge.openLoading()
   */
  openLoading () {
    callHandler.call(this, 'updateLoading', {
      show: true
    })
  }

  /**
   * closeLoading
   * 关闭系统加载动画
   * 
   * * @example
   * jsbridge.closeLoading()
   */
  closeLoading () {
    callHandler.call(this, 'updateLoading', {
      show: false
    })
  }

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
  chooseToast (options: {
    content: string;
    duration?: number;
    icon?: string;
  } | string, callback?: () => void) {
    
    if (['string', 'object'].indexOf(typeof options) < 0) {
      throwError('chooseToast arguments error: 参数格式不正确.')
      return
    }

    callHandler.call(this, 'showToast', typeof options === 'string' ? { content: options } : options)

    callback instanceof Function && callback()
    
  }

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
  updateCustomizeAppbar (useCustomizeAppbar?: boolean, options?: {
    title: string;
  }) {
    if (useCustomizeAppbar) {
      const { title: backText } = options || {}
      callHandler.call(this, 'pageNeedCustomBar', {
        needed: true,
        fullscreen: true,
        color: '#00000000',
        backText,
      })
      return
    }
    callHandler.call(this, 'pageNeedCustomBar', {
      needed: false,
    })
  }

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
  updateNavigatorButton (options: 'BACK' | 'CLOSE' | ('BACK' | 'CLOSE')[]) {
    if (typeof options === 'string' && ['CLOSE', 'BACK'].indexOf(options) < 0) {
      throwError('updateNavigatorButton arguments error: options 参数不正确')
      return
    }

    const buttonList = (
      options instanceof Array
        ? options
        : [options]
    ).filter(function (_) {
      return ['CLOSE', 'BACK'].indexOf(_) >= 0
    })

    if (buttonList.length <= 0) {
      throwError('updateNavigatorButton arguments error: options 参数不正确')
      return
    }

    callHandler.call(this, 'updateNavigatorButton', {
      buttonList,
    })
  }

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
  updateCanNavigateBack (forbiddenNavBack?: boolean | (() => void), callback?: () => void) {
    if (forbiddenNavBack) {
      
      const fallback = forbiddenNavBack instanceof Function
        ? forbiddenNavBack
        : callback instanceof Function
          ? callback
          : undefined
      
      const callbackName = randomString()
      if (fallback) {
        register.call(this, callbackName, fallback)
      }
      
      callHandler.call(this, 'updateCanNavigateBack', {
        forbiddenNavBack: true,
        callbackName,
      })
      return
    }
    callHandler.call(this, 'updateCanNavigateBack', {
      forbiddenNavBack: false,
    })
  }

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
  updateAppBarButton (options: {
    type: 'TEXT' | 'BUTTON' | 'ICON',
    text?: string;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    icon?: string;
    transparentIcon?: string;
    value?: string;
    items?: {
      icon?: string;
      text: string;
      value: string;
    }[];
  } | {
    type: 'TEXT' | 'BUTTON' | 'ICON',
    text?: string;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    icon?: string;
    transparentIcon?: string;
    value?: string;
    items?: {
      icon?: string;
      text: string;
      value: string;
    }[];
  }[], callback?: (value?: string) => void) {

    if (typeof options !== 'object') {
      throwError('updateAppBarButton arguments error: 参数格式不正确')
      return
    }

    const callbackName = randomString()

    if (callback instanceof Function) {
      register.call(this, callbackName, callback)
    }

    if (options instanceof Array) {
      const buttonList = options.filter(({ type }) => (
        ['TEXT', 'BUTTON', 'ICON'].indexOf(type) >= 0
      ))

      if (buttonList.length <= 0) {
        throwError('updateAppBarButton arguments error: 参数不正确')
        return
      }
      
      callHandler.call(this, 'updateAppBarButtonList', {
        show: true,
        callbackName,
        buttonList,
      })
      return
    }

    if (['TEXT', 'BUTTON', 'ICON'].indexOf(options.type) < 0) {
      throwError('updateAppBarButton arguments error: 参数不正确')
      return
    }

    callHandler.call(this, 'updateAppBarMenu', {
      ...options,
      ...{
        show: true,
        callbackName,
      }
    })
    
  }


  /**
   * 清除appbar右功能按钮
   * 
   * @example
   * 
   * jsbridge.clearAppBarButton()
   * 
   */
  clearAppBarButton () {
    callHandler.call(this, 'updateAppBarButtonList', {
      show: false,
    })
    callHandler.call(this, 'updateAppBarMenu', {
      show: false,
    })
  }

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
  chooseBgMusicSelector (options?: {
    typeId: string;
  } | (
    (result: {
      id: string;
      url: string;
      zhName?: string;
      enName?: string;
      duration?: number;
    }) => void
  ), callback?: (result: {
    id: string;
    url: string;
    zhName?: string;
    enName?: string;
    duration?: number;
  }) => void) {
    const fallback =
      options instanceof Function
        ? options
        : callback instanceof Function
          ? callback
          : undefined
    
    const callbackName = randomString()

    if (fallback instanceof Function) {
      register.call(this, callbackName, fallback)
    }
    
    callHandler.call(this, 'openBgMusicView', typeof options === 'object' ? {
      ...options,
      ...{
        callbackName,
      }
    } : {
      callbackName,
    })
  }

  /**
   * saveFilesToLocale
   * 保存文件到本地
   * @param {object} files 文件列表内容
   */
  saveFilesToLocale (options: {
    files?: {
      type: 'IMAGE' | 'VIDEO';
      url: string;
    }[];
  }) {
    const self = this
    const { files: oriFiles } = options || {}
    
    // 做入参兼容
    if (!oriFiles || !oriFiles.length) {
      throwError('saveFilesToLocale arguments error: files 参数不合法。')
      return
    }

    const files = oriFiles.filter(({ type }) => (['IMAGE', 'VIDEO'].indexOf(type) >= 0 ))
  

     // 做入参兼容
     if (!files || !files.length) {
      throwError('saveFilesToLocale arguments error: files 参数不合法。')
      return
    }
    // 新版本处理方案
    if (
      (this.device === 'ios' && !isVersionLessThan(this.version || '0.0.0', '2.1.4'))
      ||
      (this.device === 'android' && !isVersionLessThan(this.version || '0.0.0', '2.1.400'))
    ) {
      callHandler.call(this, 'saveToLocale', {
        files,
      })
      return
    }
  
    // 老版本使用方案
    const loopDownloadFiles = function (index = 0) {
      if (index >= files.length) {
        return
      }
  
      self.callHandler('saveToLocale', {
        type: 'PICTURE',
        url: files[index].url,
      })
  
      setTimeout(function () {
        loopDownloadFiles(index + 1)
      }, 110)
    }
    
    loopDownloadFiles()
  }


  /**
   * 多媒体输入设备
   * @param options 
   */
  chooseCaptureDevice (options: {
    bucket?: string;
    path?: string;
    region?: string;
    type: 'CAMERA' | 'CAMCORDER' | 'MICROPHONE';
  }, callback?: (result: {
    url: string;
    bucketName: string;
    objectKey: string;
    type: 'IMAGE' | 'AUDIO' | 'VIDEO';
    width?: number;
    height?: number;
    duration?: number;
    poster?: string;
  }) => void) {
    const callbackName = randomString()

    if (callback instanceof Function) {
      register.call(this, callbackName, callback)
    }

    callHandler.call(this, 'chooseCaptureDevice', {
      ...{
        bucket: 'common-static-resources',
        region: 'oss-cn-beijing',
        path: 'dooluu-devtool/files/'
      },
      ...options,
      ...{
        callbackName,
      },
    })
  }

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
  chooseLocalMediaSelector (options?: {
    bucket?: string;
    path?: string;
    region?: string;
    count?: number;
    accept?: 'IMAGE' | 'VIDEO';
    selected?: any[];
    organizationType?: 'BABY' | 'GRADE' | 'SCHOOL' | 'INSTITUTION';
  } | (
    (result: {
      url: string;
      bucketName: string;
      objectKey: string;
      type: 'IMAGE' | 'AUDIO' | 'VIDEO';
      width?: number;
      height?: number;
      duration?: number;
      poster?: string;
    }[]) => void
  ), callback?: (result: {
    url: string;
    bucketName: string;
    objectKey: string;
    type: 'IMAGE' | 'AUDIO' | 'VIDEO';
    width?: number;
    height?: number;
    duration?: number;
    poster?: string;
  }[]) => void) {
    const fallback = (result: {
      url: string;
      bucketName: string;
      objectKey: string;
      type: 'IMAGE' | 'AUDIO' | 'VIDEO';
      width?: number;
      height?: number;
      duration?: number;
      poster?: string;
    }[]) => {
      if (options instanceof Function) {
        options(result)
      }
      if (callback instanceof Function) {
        callback(result)
      }
    }
    const callbackName = randomString()
    register.call(this, callbackName, fallback)
    callHandler.call(this, 'openSystemAlbumView', {
      ...{
        bucket: 'common-static-resources',
        region: 'oss-cn-beijing',
        path: 'dooluu-devtool/files/'
      },
      ...options,
      ...{
        callbackName
      },
    })
  }

  /**
   * 唤起云相册
   * chooseCloudMediaSelector
   */
  chooseCloudMediaSelector (options: {
    babyId?: string;
    gradeId?: string;
    accept?: 'IMAGE' | 'VIDEO';
    count?: number;
    selected?: any[];
  }, callback?: (result: any) => void) {

    if (typeof options !== 'object') {
      throwError('chooseCloudMediaSelector arguments error: arguments[0] not object.')
      return
    }

    const {
      babyId,
      gradeId,
      accept: media,
      count,
      selected,
    } = options

    if (!babyId && !gradeId) {
      throwError('chooseCloudMediaSelector arguments error: target undefined.')
      return
    }

    const callbackName = randomString()

    if (callback instanceof Function) {
      register.call(this, callbackName, callback)
    }

    callHandler.call(this, 'openAlbumView', {
      ...{
        media,
        selected,
        count: count ? count : undefined,
        callbackName,
      },
      ...(
        babyId ? {
          target: 'BABY',
          targetId: babyId,
        }
        : {
          target: 'CLASS',
          targetId: gradeId,
        }
      ),
    })

  }

  /**
   * chooseMediaPreviewer
   * 打开多媒体文件播放器，目前不支持视频图片混合播放，所以取urls[0]['type']
   */
  chooseMediaPreviewer (options: {
    current?: number;
    type?: 'IMAGE' | 'VIDEO';
    urls: {
      type?: 'IMAGE' | 'VIDEO';
      url: string;
      cover?: string;
      width?: number;
      height?: number;
    }[];
  }) {
    const { current = 0, urls } = options
    if (!(urls instanceof Array) || !urls.length) {
      throwError('chooseMediaPreviewer arguments error: urls is error')
      return
    }
    const [{ type = 'IMAGE' }] = urls
    callHandler.call(this, 'openMediaPreviewer', {
      current,
      urls: urls.map((_) => ({
        ..._,
        ...{
          type: options.type || type,
        }
      })),
    })
  }

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
  shareAppMessage (options: {
    title: string;
    desc?: string;
    link?: string;
    imgUrl?: string;
    shareType?: 'TIMELINE' | 'FRIEND' | 'IM';
    shareMenus?: ('TIMELINE' | 'FRIEND' | 'IM')[];
    bizType?: 'PICTUREBOOK' | 'ALBUM';
  }, callback?: (result?: 'TIMELINE' | 'FRIEND' | 'IM' | 'CANCEL') => void) {
    const {
      title,
      desc,
      link,
      imgUrl: icon,
      shareType,
      shareMenus,
      bizType,
    } = options

    const callbackName = randomString()

    if (callback instanceof Function) {
      console.warn('callback 需要多鹿/多鹿老师版本 > 2.1.700')
      register.call(this, callbackName, callback)
    }

    if (bizType) {
      console.warn('bizType 需要多鹿/多鹿老师版本 > 1.9.400')
    }
    
    callHandler.call(this, 'pullShare', {
      title,
      desc,
      link: link || window.location.href,
      icon,
      bizType,
      shareType,
      shareMenus: shareMenus instanceof Array ? shareMenus : ['TIMELINE', 'FRIEND', 'IM'],
      callbackName,
    })
  }

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
  shareImageFile (options: {
    imgUrl: string;
    shareType?: 'TIMELINE' | 'FRIEND';
    shareMenus?: ('TIMELINE' | 'FRIEND')[];
  }, callback?: (result?: 'TIMELINE' | 'FRIEND' | 'CANCEL') => void) {
    const {
      imgUrl,
      shareType,
      shareMenus,
    } = options

    const callbackName = randomString()
    if (callback instanceof Function) {
      console.warn('callback 需要多鹿/多鹿老师版本 > 2.1.700')
      register.call(this, callbackName, callback)
    }

    callHandler.call(this, 'pullShare', {
      title: '多鹿',
      desc: '记录美好童年',
      link: 'http://dooluu.com.cn',
      imgUrl,
      shareType,
      shareMenus: shareMenus instanceof Array ? shareMenus : ['TIMELINE', 'FRIEND'],
      callbackName,
    })
  }

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
  shareMiniAppMessage (options: {
    title: string;
    desc: string;
    link: string;
    imgUrl?: string;
    ghId: string;
  }, callback?: (result?: 'TIMELINE' | 'FRIEND' | 'IM' | 'CANCEL') => void) {
    const {
      title,
      desc,
      link,
      imgUrl: icon,
      ghId: userName,
    } = options

    const callbackName = randomString()
    if (callback instanceof Function) {
      console.warn('callback 需要多鹿/多鹿老师版本 > 2.1.700')
      register.call(this, callbackName, callback)
    }

    callHandler.call(this, 'pullShare', {
      shareType: 'MINIAPP',
      link,
      userName,
      title,
      desc,
      icon,
      callbackName,
    })
  }

  /**
   * sharePosterMessage
   * 分享海报，海报由服务端生成
   * @param {object} options
   * @options {string} bizType 业务类型
   * @options {string} targetId 业务类型对应的id
   * @options {string} bizContent 业务内容
   */
  sharePosterMessage (options: {
    bizType: 'FEED' | 'DOOLUU' | 'PRODUCT' | 'SHOP' | 'LIVE';
    targetId: string | number;
    bizContent?: string;
  }) {
    const {
      bizType,
      targetId,
      bizContent,
    } = typeof options === 'object' ? options : {
      bizType: undefined,
      targetId: undefined,
      bizContent: undefined,
    }

    // if(
    //   !(this.device === 'ios' && !isVersionLessThan(this.version!, '1.9.97'))
    //   ||
    //   !(device === 'android' && !isVersionLessThan(this.version!, '1.9.970'))
    // ) {
    //   return
    // }

    if (!targetId || typeof targetId !== 'string' || typeof targetId !== 'number') {
      throwError('sharePosterMessage arguments error: options.targetId is error.')
      return
    }

    if (!bizType || typeof bizType !== 'string' || ['FEED', 'DOOLUU', 'PRODUCT', 'SHOP', 'LIVE'].indexOf(bizType) < 0) {
      throwError('sharePosterMessage arguments error: bizType is error.')
      return
    }

    callHandler.call(this, 'chooseAppMessageShare', {
      bizType,
      targetId,
      bizContent,
    })
  }

  /**
   * shareToFeed
   * @param options 
   * @param callback 
   */
  shareToFeed (options: {
    title: string;
    desc?: string;
    imgUrl?: string;
    link?: string;
    bizType?: string;
    target?: 'SCHOOL' | 'GRADE' | 'BABY' | 'INSTITUTION';
    targetId?: string;
    targetGroups?: ('SCHOOL' | 'GRADE' | 'BABY' | 'INSTITUTION')[];
  }, callback?: (result: boolean) => void) {

    if (typeof options !== 'object') {
      throwError('shareToFeed arguments error: options is undefined.')
      return
    }

    const {
      title,
      desc,
      imgUrl,
      link,
      target: optionTarget,
      targetId: optionTargetId,
      targetGroups,
      bizType,
    } = options

    const targetLegalList = this.clientType === 'c'
      ? ['BABY']
      : ['SCHOOL', 'GRADE', 'INSTITUTION']

    const target = optionTarget && typeof optionTarget === 'string' && targetLegalList.indexOf(optionTarget) >= 0
      ? optionTarget
      : undefined

    const targetId = target && optionTargetId
      ? optionTargetId
      : undefined
    
    const callbackName = randomString()

    const groupKeys = target && targetId
      ? undefined
      : targetGroups
        ? targetGroups.filter(
          (_) => (
            targetLegalList.indexOf(_) >= 0
          )
        )
        : undefined

    if (callback instanceof Function) {
      register.call(this, callbackName, callback)
    }
    
    callHandler.call(this, 'shareLinkToFeed', {
      title,
      desc,
      cover: imgUrl,
      link: link || window.location.href,
      bizType,
      target,
      targetId,
      groupKeys: groupKeys && groupKeys.length ? groupKeys : undefined,
      callbackName,
    })
    
  }

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
  chooseCashier (options: {
    orderNo: string;
    redirect?: string;
  }, callback?: (result: {
    status: 'SUCCESS' | 'FAIL' | 'CANCEL',
    message?: string;
  }) => void) {

    const { orderNo, redirect } = typeof options === 'object' ? options : {
      orderNo: undefined,
      redirect: undefined,
    }

    if (!orderNo || typeof orderNo !== 'string') {
      throwError('chooseCashier arguments error: options.orderNo is error.')
      return
    }

    callHandler.call(this, 'chooseLocalPay', {
      orderNo,
      redirect,
    }, function (result) {
      if (callback instanceof Function) {
        callback(result)
      }
    })
  }

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
  choosePay (options: {
    orderNo: string;
    channel: 'DOOLUU' | 'ALIPAY' | 'WECHAT' | 'BANK_TRANSFER';
    redirect?: string;
  }, callback?: (result: {
    status: 'SUCCESS'| 'CANCEL' | 'FAIL' | 'CLOSE' | 'UNKNOW';
    message?: string;
  }) => void) {

    const { orderNo, channel, redirect } = typeof options === 'object' ? options : {
      orderNo: undefined,
      channel: undefined,
      redirect: undefined,
    }

    if (!orderNo || typeof orderNo !== 'string') {
      throwError('choosePay arguments error: options.orderNo is error.')
      return
    }

    if (!channel || ['DOOLUU','ALIPAY','WECHAT'].indexOf(channel) < 0) {
      throwError('chooseCashier arguments error: options.channel is error.')
      return
    }

    if (this.device !== 'ios' && channel === 'DOOLUU') {
      throwError('chooseCashier arguments error: 请勿在非IOS设备中使用鹿币支付。')
      return
    }

    callHandler.call(this, 'choosePay', {
      orderNo,
      channel,
      redirect,
    }, function (result) {
      if (callback instanceof Function) {
        callback(result)
      }
    })
  }

  /**
   * copy2Clipboard
   * 复制图片到剪切板，辅助文案请使用js
   * @param {string} url 需要辅助的图片的url
   */
  copy2Clipboard (content: string) {
    if (!content || typeof content !== 'string') {
      throwError('copy2Clipboard error: content is error.')
      return
    }
    callHandler.call(this, 'copy2Clipboard', {
      contentType: content.indexOf('http') >= 0 ? 'PICTURE' : 'TEXT',
      content,
    })
  }

  /**
   * chooseClipboardListener
   * 唤起链接识别监听器
   * @param {function} callback 识别到链接，并且点击确定后回调链接内容
   */
  chooseClipboardListener (callback?: (result: {
    type: 'LINK',
    icon?: string;
    link: string;
    title: string;
    description?: string;
  }) => void) {

    const callbackName = randomString()

    if (callback instanceof Function) {
      register.call(this, callbackName, callback)
    }

    callHandler.call(this, 'chooseClipboardListener', {
      type: 'LINK',
      callbackName,
    })
  }

  /**
   * chooseHpplay
   * 唤起投屏功能
   * IOS并不支持，请使用airplay
   * @param {function} callback 投屏/结束投屏后的回调，并且返回投屏状态
   */
  chooseHpplay (callback?: (result: boolean) => void) {
    if (this.device === 'ios') {
      return
    }
    callHandler.call(this, 'chooseHpplay', function (result) {
      if (!(callback instanceof Function)) {
        return
      }
      callback(result)
    })
  }

  /**
   * 预览亲子打卡模板
   * previewPunchTemplate
   */

  choosePunchTemplatePreview (options: {
    organizationType?: 'GRADE' | 'SCHOOL';
    organizationId?: string;
    id?: string;
    topic?: string;
    mark?: string;
    feedDesc?: string;
    desc?: string;
    descStr?: string;
    medias?: {
      url: string;
      type: 'IMAGE' | 'VIDEO';
      width?: number;
      height?: number;
      duration?: number;
      cover?: string;
    }[];
    tag?: string;
    end?: number;
    repeat?: 1 | 0;
  }) {
    callHandler.call(this, 'previewPunchTemplate', typeof options === 'object' ? options : undefined)
  }

  /**
   * 填充亲子打卡模板
   * fillPunchFromTemplate
   */
  fillPunchTemplate (options: {
    organizationType?: 'GRADE' | 'SCHOOL';
    organizationId?: string;
    id?: string;
    topic?: string;
    mark?: string;
    feedDesc?: string;
    desc?: string;
    descStr?: string;
    medias?: {
      url: string;
      type: 'IMAGE' | 'VIDEO';
      width?: number;
      height?: number;
      duration?: number;
      cover?: string;
    }[];
    tag?: string;
    end?: number;
    repeat?: 1 | 0;
  }) {
    callHandler.call(this, 'fillPunchFromTemplate', typeof options === 'object' ? options : undefined)
  }

  /**
   * fillFromTemplate
   * 选择模板回填客户端
   * @param options 
   */
  fillFromTemplate (options: {
    type: 'FEED' | 'WISHES';
    data: string;
  }) {
    const {
      type = 'FEED',
      data = JSON.stringify({}),
    } = options || {}

    if (type !== 'FEED') {
      throwError('fillFromTemplate arguments error: type的值不在可选范围。')
      return
    }

    if (typeof data !== 'string') {
      throwError('fillFromTemplate arguments error: data必须是一个json字符串。')
      return
    }

    callHandler.call(this, 'fillFromTemplate', {
      type,
      data,
    })
  }

  /**
   * 成长相册预览页面打印按钮调用端弹框
   * growthAlbumPrint
   * @param options 
   */
  choosegGrowthAlbumPrint (options: {
    growthAlbumId: string;
    spuId: string;
  }) {
    const {
      growthAlbumId,
      spuId,
    } = options || {}
    if (!growthAlbumId) {
      throwError('growthAlbumPrint arguments error: growthAlbumId is undefined.')
      return
    }
    if (!spuId) {
      throwError('growthAlbumPrint arguments error: spuId is undefined.')
      return
    }
    callHandler.call(this, 'growthAlbumPrint', {
      growthAlbumId,
      spuId,
    })
  }

  /**
   * 唤醒客户端相册一键提醒分享
   * growthAlbumRemind
   * @param {object} options
   * @options {string} growthAlbumId 成长册id
   * @options {termId} 学期id 
   * @options {gradeId} gradeId 班级id
   */
  chooseGrowthAlbumRemind (options: {
    growthAlbumId: string;
    termId: string;
    gradeId: string;
  }) {
    const {
      growthAlbumId,
      termId,
      gradeId
    } = options || {}
    if (!growthAlbumId) {
      throwError('growthAlbumRemind arguments error: growthAlbumId is undefined.')
      return
    }
    if (!termId) {
      throwError('growthAlbumRemind arguments error: termId is undefined.')
      return
    }
    if (!gradeId) {
      throwError('growthAlbumRemind arguments error: gradeId is undefined.')
      return
    }
    callHandler.call(this, 'growthAlbumRemind', {
      growthAlbumId,
      termId,
      gradeId,
    })
  }
  

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
  
  chooseMap (options?: {
    withMap?: boolean;
    associate?: boolean;
    longitude?: string;
    latitude?: string;
    province?: string;
    city?: string;
    area?: string;
    name?: string;
    address?: string;
  } | ((result: {
    longitude?: string;
    latitude?: string;
    province?: string;
    city?: string;
    area?: string;
    address?: string;
    name?: string;
  }) => void), callback?: (result: {
    longitude?: string;
    latitude?: string;
    province?: string;
    city?: string;
    area?: string;
    address?: string;
    name?: string;
  }) => void) {
    const {
      withMap = false,
      associate = undefined,
      longitude = undefined,
      latitude = undefined,
      province = undefined,
      city = undefined,
      area = undefined,
      name = undefined,
      address = undefined,
    } = typeof options === 'object'
      ? options
      : {}
    const fallback = callback instanceof Function
      ? callback
      : options instanceof Function
        ? options
        : undefined
      
    const callbackName = randomString()

    if (fallback) {
      register.call(this, callbackName, fallback)
    }
    callHandler.call(this, 'chooseMapAddressSelecter', {
      withMap,
      associate,
      longitude,
      latitude,
      province,
      area,
      city,
      name,
      address,
      callbackName,
    })
  }
}



  
export default function () {
  if (!(instance instanceof JSBridge)) {
    instance = new JSBridge()
  }
  return instance
}
