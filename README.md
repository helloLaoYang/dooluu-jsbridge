

[1. 概述](#概述)

[2. 使用步骤](#使用步骤)
  
[2.1 引入jsbridge项目](#1.引入jsbridge项目)

[2.2 如何使用](#2.如何使用)
  
[2.3 通过ready函数验证注入成功](#3.通过ready函数验证注入成功)

[2.4 通过error接收所有的错误（暂不支持）](#4.通过error接收所有的错误)

[3 调用说明](#调用说明)

[4. 基础信息接口](#基础信息接口)

[4.1 获取用户登陆票据](#获取用户登陆票据)

[4.2 获取客户端类型](#获取客户端类型)

[4.3 获取当前网络类型](#获取当前网络类型)

[4.4 获取当前客户端版本号](#获取当前客户端版本号)

[4.5 获取当前webview信息](#获取当前webview信息)

[5. 分享接口](#分享接口)

[5.1 分享链接](#分享链接)

[5.2 分享图片](#分享图片)

[5.3 分享微信小程序卡片](#分享微信小程序卡片)

[5.4 分享海报](#分享海报)

[6. 多媒体接口](#多媒体接口)

[6.1 浏览媒体文件](#浏览媒体文件)

[6.2 保存文件到相册](#保存文件到相册)

[6.3 唤起输入设备](#唤起输入设备)

[6.4 唤起本地相册](#唤起本地相册)

[6.5 唤起云相册](#唤起云相册)

[6.6 唤起多鹿音乐](#唤起多鹿音乐)

[7. 系统控件接口](#系统控件接口)

[7.1 提示框](#提示框)

[7.2 打开新的窗口](#打开新的窗口)

[7.3 关闭当前webview](#关闭当前webview)

[7.4 打开加载动画](#打开加载动画)

[7.5 关闭加载动画](#关闭加载动画)

[7.6 启用/关闭自定义状态栏](#启用/关闭自定义状态栏)

[7.7 设置webview功能键](#设置webview功能键)

[7.8 禁用/启用webview功能键](#禁用/启用webview功能键)

[7.9 设置webview额外按钮](#设置webview额外按钮)

[7.10 清除webview额外按钮](#清除webview额外按钮)

[7.11 复制图片到剪切板](#复制图片到剪切板)

[7.12 唤起链接识别监听器](#唤起链接识别监听器)

[7.13 启用乐播投屏](#启用乐播投屏)

[8. 支付](#支付)

[8.1 打开收银台](#打开收银台)

[8.2 唤起支付](#唤起支付)

[9. 亲子打卡](#亲子打卡)

[9.1 预览亲子打卡模板](#预览亲子打卡模板)

[9.2 填充亲子打卡模板](#填充亲子打卡模板)

## 概述

> 该项目是客户端向前端提供的基于网页开发工具包。通过使用jsbridge，开发者可借助客户端跨权限高效地使用系统的能力，优化网页体验。接下来会说明如何使用及相关注意事项。

## 使用步骤

> 此项目目前只提供commonjs版本，所以只能使用webpack或其他构建工具。需要在html中直接加载请自行改造。

#### 1.引入jsbridge项目

> 在maltbaby-dooluu项目的packages文件架下直接克隆该项目即可。

```bash

cd maltbaby-dooluu/packages && git clone git@code.aliyun.com:enjoytech-fe/dooluu-jsbridge.git


```

#### 2.如何使用

> 在项目中直接引入dooluu-jsbridge并执行即可返回jsbridge对象，用于后续的操作。

* 由于采用单例模式，jsbridge对象可随意选择是否缓存备用。

``` javascript
// 引入项目
import JSBridge from 'dooluu-jsbridge'

// 获取jsbridge对象
const jsbridge = JSBridge()

```

#### 3.通过ready函数验证注入成功

> 使用ready函数验证jsbridge注入成功

```javascript

jsbridge.ready(function () {
  // jsbridge 可正常使用
  // your code
})

```

#### 4.通过error接收所有的错误

> 使用ready函数处理jsbridge在使用中遇到的所有的错误

* 暂不支持

```javascript

jsbridge.error(function () {
  // jsbridge不可使用
})

```

## 调用说明

1. 由于安卓与IOS的实现方式问题，故所有的接口返回都是通过`callback`的形式，不支持直接`return`或者`promise`。

2. 在开发者模式下，会在console中有报错和调用日志。

3. 请按照文档使用。如需使用特殊情况，请直接使用`callHandler`，但是不保证其参数的正确性与兼容性。

* callHandler调用示例

```javascript
// 示例一
const result = jsbridge.callHandler(apiName)

// 示例二
jsbridge.callHandler(apiName, function (result) {
  // code
})

// 示例三
jsbridge.callHandler(apiName, options, function (result) {
  // code
})

```


## 基础信息接口

#### 获取用户登陆票据

> 获取用户在客户端缓存的token，并写入cookie以备前端fetch数据。

```javascript

jsbridge.getUserTicket(function (token) {
  if (token) {
    document.cookie = `token=${ token };domain=.maltbaby.com.cn;path=/`
  }
})

```

#### 获取客户端类型

> 用户当前客户端的类型: b/c

```javascript

jsbridge.getClientType(function (clientType) {
  // clientType: c
  // your code
})


```

#### 获取当前网络类型

> 获取当前用户的网络类型：unknown' | 'wifi' | 'wwan' | 'none'

```javascript

jsbridge.getNetworkType(function (networkType) {
  // networkType: wifi
  // your code
})

```

#### 获取当前客户端版本号

> 获取当前app的版本号，在微信中请使用微信[获取微信版本号](###获取微信版本号)

```javascript

jsbridge.getClientVersion(function (version) {
  // version: 1.3.653
  // your code
})

```

#### 获取当前webview信息

> 获取当前webview在显示屏上的位置信息

```javascript

jsbridge.getWebviewInfo({function ({
  x, y, width, height, parentPageId, sessionId, aId, isFullScreen, clientVersion,
}) {
  //  x: number;
  //  y: number;
  //  width: number;
  //  height: number;
  //  parentPageId?: string;
  //  sessionId?: string;
  //  aId?: string;
  //  isFullScreen: boolean;
  //  clientVersion: string;
}})

```

## 分享接口

> 用于分享到微信/微信朋友圈/多鹿客户端聊天对象


#### 分享链接

> 调起客户端链接分享功能，并返回用户的操作反馈（需要客户端版本大于2.1.7）

```javascript

jsbridge.shareAppMessage({
  title: '', // 分享标题,
  desc: '', // 分享描述，分享到朋友圈时无效
  imgUrl: '', //分享图标，推荐128*128的jpg图,
  link: '', // 分享链接
  shareType: '', // 指定分享对象
  shareMenus: [], // 分享菜单定制
}, function (result) {
  // result: 'TIMELINE' | 'FRIEND' | 'IM' | 'CANCEL'
})
```

#### 分享图片

> 调起客户端图片分享功能，并返回用户的操作反馈（需要客户端版本大于2.1.7）

* 多鹿客户端聊天对象（IM）暂时不支持。

```javascript

jsbridge.shareImageFile({
  imgUrl: '', //分享图标，推荐128*128的jpg图,
  shareType: '', // 指定分享对象
  shareMenus: [], // 分享菜单定制
}, function (result) {
  // result: 'TIMELINE' | 'FRIEND' | 'IM' | 'CANCEL'
})

```

#### 分享微信小程序卡片

* 无法指定和定制分享菜单，只能分享给朋友

```javascript

jsbridge.shareMiniAppMessage({
  title: '', // 分享标题,
  desc: '', // 分享描述
  imgUrl: '', //分享封面图
  link: '', // 分享链接，小程序路径参数集合
  ghId: '', // 小程序原始id
})

```

#### 分享海报

* 全部由服务端与客户端处理

```javascript

jsbridge.sharePosterMessage({
  bizType: '', // 业务类型,
  targetId: '', // 业务类型对应的id
  bizContent: '', //业务内容
})

```

## 多媒体接口

#### 1.浏览媒体文件

* 视频与图片不能混合浏览，为保证兼容性视频封面的分辨率应当与视频本身一致

```javascript

jsbridge.chooseMediaPreviewer({
  current: 0, // 当前浏览的编号
  type: '', // 文件类型，不填则使用urls[0].type
  urls: [{
    type: '', // 文件类型
    url: '', // 文件地址
    cover: '', // 视频封面
    width: '', // 文件尺寸
    height: '',
  }]
})

```

#### 2.保存文件到相册

* 低版本客户端每隔100ms才会下载一张图片，下载多图片时耗时较久。

```javascript

jsbridge.saveFilesToLocale({
  files: [{
    url: '', // 文件地址
    type: 'IMAGE', // 目前只支持图片
  }],
})

```

#### 唤起输入设备

* 打开系统相机，录像机、录音机功能。

* `bucket`、`path`、`region`在不需要指定的情况下，尽可能不做改动。

```javascript

jsbridge.chooseCaptureDevice({
  bucket: '', // 存储空间名
  path: '', // 存储路径，包含文件名
  region: '', // 存储区域
  type: 'CAMERA' | 'CAMCORDER' | 'MICROPHONE', // 需要启用的设备
}, function (result) {
  // code
})

```

#### 唤起本地相册

* `organizationType`只在特殊场景使用。

```javascript

jsbridge.chooseLocalMediaSelector({
  bucket: '', // 存储空间名
  path: '', // 存储路径，包含文件名
  region: '', // 存储区域
  count: '', // 最大可选文件数
  accept: 'IMAGE' | 'VIDEO', // 可选文件类型
  selected: [], // 已选文件路径
  organizationType: 'BABY' | 'GRADE' | 'SCHOOL' | 'INSTITUTION', // 用于过滤视频时长
}, function (result) {
  // code
})

```

#### 唤起云相册

* 唤起宝宝或者班级的云相册，需要当前登录用户有权限

```javascript

jsbridge.chooseCloudMediaSelector({
  babyId: '', // 宝宝id, 与gradeId 传一个即可
  gradeId: '', // 班级id
  accept: 'IMAGE' | 'VIDEO', // 可选文件类型
  selected: [], // 已选文件路径
  count: '', // 最大可选文件数
}, function (result) {
  // code
})

```

#### 唤起多鹿音乐

```javascript

jsbridge.chooseBgMusicSelector({}, function (result) {
  typeId: '', // 分类id
})

```

## 系统控件接口
#### 提示框

```javascript

jsbridge.chooseToast(// text...)

// or

jsbridge.chooseToast({
  content: '', // 提示内容
  duration: ''， // 提示显示市场，不推荐使用
})

```

#### 打开新的窗口

> 用于打开原生链接或者网页链接

```javascript

jsbridge.openView({
  url: 'http...',
}, function () {

})

// or

jsbridge.openView({
  url: 'maltbaby...',
})

```

#### 关闭当前webview

```javascript
jsbridge.closeView({
  redirectUrl: '', // 关闭后打开新的schema
})


```

#### 打开加载动画

```javascript

jsbridge.openLoading()

```

#### 关闭加载动画

```javascript

jsbridge.closeLoading()

```

#### 启用/关闭自定义状态栏

```javascript

// 启用
jsbridge.updateCustomizeAppbar(true)

// 关闭
jsbridge.updateCustomizeAppbar()

```

#### 设置webview功能键

> 设置关闭，返回按钮的显示

```javascript

jsbridge.updateNavigatorButton([
  'BACK',
  'CLOSE',
])


```

#### 禁用/启用webview功能键

```javascript

// 禁用
jsbridge.updateCanNavigateBack(true, function () {
  // code
})

// 恢复启用
jsbridge.updateCanNavigateBack()

```

#### 设置webview额外按钮

```javascript

jsbridge.updateAppBarButton([{
  type: 'TEXT' | 'BUTTON' | 'ICON', // 按钮类型
  text: '', // 按钮文字，type为ICON时无效
  color: '', // 按钮文字，type为ICON时无效
  bgColor: '', // 按钮背景颜色，type为ICON时无效
  icon: '', // 图片按钮链接，仅在type为ICON时生效
  transparentIcon: '', // 结合updateCustomizeAppbar使用时，图片按钮链接，仅在type为ICON时生效
  value: // 标识
  items: [{
    text: '', // 按钮文字
    icon: '', // 按钮图标链接
    value: '', // 标识
  }]
}])

```

#### 清除webview额外按钮

```javascript

jsbridge.clearAppBarButton()

```

#### 复制图片到剪切板

```javascript

jsbridge.copy2Clipboard({
  url: '', // 图片链接
})

```

#### 唤起链接识别监听器

```javascript

jsbridge.chooseClipboardListener(function (result) {
  // code
})

```

#### 启用乐播投屏

* 仅限安卓使用

```javascript

jsbridge.chooseHpplay(function (result) {
  // result: true/false
  // code 
})

```

## 支付

#### 打开收银台

```javascript

jsbridge.chooseCashier({
  orderNo: '', // 订单编号（交易单号）
}, function (result) {
  // code
})

```

#### 唤起支付

```javascript

jsbridge.choosePay({
  orderNo: '', // 订单编号（交易单号）
  channel: 'DOOLUU' | 'ALIPAY' | 'WECHAT'; // 支付方式 
}, function (result) {
  // code
})

```

## 亲子打卡

#### 预览亲子打卡模板

```javascript

jsbridge.choosePunchTemplatePreview({
  organizationType: 'code',
  organizationId: '',
  id: '',
  topic: '',
  mark: '',
  feedDesc: '',
  desc: '',
  descStr: '',
  medias: {
    url: '',
    type: 'IMAGE' | 'VIDEO',
    width: '',
    height: '',
    duration: '',
    cover: '',
  }[];
  tag: '',
  end: '',
  repeat: 1 | 0,
})

```

#### 填充亲子打卡模板

```javascript

jsbridge.fillPunchTemplate({
  organizationType: 'GRADE',
  organizationId: '',
  id: '',
  topic: '',
  mark: '',
  feedDesc: '',
  desc: '',
  descStr: '',
  medias: {
    url: '',
    type: 'IMAGE' | 'VIDEO',
    width: '',
    height: '',
    duration: '',
    cover: '',
  }[];
  tag: '',
  end: '',
  repeat: 1 | 0,
})

```
