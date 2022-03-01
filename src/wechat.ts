
/**
 * 微信jssdk
 */
import { mountScript } from './utils'

export default (callback?: ($wechat: any) => void) => {
 // 加载script
 mountScript('//res.wx.qq.com/open/js/jweixin-1.6.0.js', () => {
  // 注入config
  if (callback instanceof Function) {
    callback(window.wx)
  }
})
}

