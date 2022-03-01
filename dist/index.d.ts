import { JSBridge as JSBridgeOrigin } from 'dooluu-common/services/jsbridge';
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
export declare const promiseify: (fn: Function) => (...args: any) => Promise<any>;
export declare class JSBridge extends JSBridgeOrigin {
    $jsbridge: any;
    $wechat?: any;
    /**
     * 设备类型
     * 'android' | 'ios'
     */
    device: 'android' | 'ios';
    /**
     * 浏览器类型
     * 'dooluu' | 'micromessenger' | 'miniprogram' | 'unknown
     */
    browser: any;
    /**
     * 版本号
     * @string
     */
    version?: string;
    /**
     * 网络类型
     * 'unknown' | 'wifi' | 'wwan' | 'none'
     */
    networkType: 'unknown' | 'wifi' | 'wwan' | 'none';
    /**
     * 客户端类型
     * 'c' | 'b'
     */
    clientType: 'c' | 'b';
    constructor();
    _init(callback: () => void): void;
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
    onLifecycle(callback: (result: {
        status: 'resume' | 'pause' | 'destroy';
    }) => void): void;
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
    ready(callback: () => void): void;
    /**
     *
     * @param callback
     */
    error(callback: (error: Error) => void): void;
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
    getUserTicket(callback: (token?: string) => void): void;
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
    getClientType(callback: (getClientType: 'c' | 'b') => void): void;
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
    getNetworkType(callback: (networkType: 'unknown' | 'wifi' | 'wwan' | 'none') => void): void;
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
    getClientVersion(callback: (version: string) => void): void;
    /**
     *
     * @param options
     */
    getWebviewInfo(callback: (result: {
        x: number;
        y: number;
        width: number;
        height: number;
        parentPageId?: string;
        sessionId?: string;
        aId?: string;
        isFullScreen: boolean;
        clientVersion: string;
    }) => void): void;
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
    closeView(options?: {
        redirectUrl: string;
    }): void;
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
    openView(options: {
        url: string;
    }, callback?: () => void): void;
    /**
     * openLoading
     * 打开系统加载动画
     *
     * @example
     * jsbridge.openLoading()
     */
    openLoading(): void;
    /**
     * closeLoading
     * 关闭系统加载动画
     *
     * * @example
     * jsbridge.closeLoading()
     */
    closeLoading(): void;
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
    chooseToast(options: {
        content: string;
        duration?: number;
        icon?: string;
    } | string, callback?: () => void): void;
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
    updateCustomizeAppbar(useCustomizeAppbar?: boolean, options?: {
        title: string;
    }): void;
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
    updateNavigatorButton(options: 'BACK' | 'CLOSE' | ('BACK' | 'CLOSE')[]): void;
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
    updateCanNavigateBack(forbiddenNavBack?: boolean | (() => void), callback?: () => void): void;
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
    updateAppBarButton(options: {
        type: 'TEXT' | 'BUTTON' | 'ICON';
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
        type: 'TEXT' | 'BUTTON' | 'ICON';
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
    }[], callback?: (value?: string) => void): void;
    /**
     * 清除appbar右功能按钮
     *
     * @example
     *
     * jsbridge.clearAppBarButton()
     *
     */
    clearAppBarButton(): void;
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
    chooseBgMusicSelector(options?: {
        typeId: string;
    } | ((result: {
        id: string;
        url: string;
        zhName?: string;
        enName?: string;
        duration?: number;
    }) => void), callback?: (result: {
        id: string;
        url: string;
        zhName?: string;
        enName?: string;
        duration?: number;
    }) => void): void;
    /**
     * saveFilesToLocale
     * 保存文件到本地
     * @param {object} files 文件列表内容
     */
    saveFilesToLocale(options: {
        files?: {
            type: 'IMAGE' | 'VIDEO';
            url: string;
        }[];
    }): void;
    /**
     * 多媒体输入设备
     * @param options
     */
    chooseCaptureDevice(options: {
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
    }) => void): void;
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
    chooseLocalMediaSelector(options?: {
        bucket?: string;
        path?: string;
        region?: string;
        count?: number;
        accept?: 'IMAGE' | 'VIDEO';
        selected?: any[];
        organizationType?: 'BABY' | 'GRADE' | 'SCHOOL' | 'INSTITUTION';
    } | ((result: {
        url: string;
        bucketName: string;
        objectKey: string;
        type: 'IMAGE' | 'AUDIO' | 'VIDEO';
        width?: number;
        height?: number;
        duration?: number;
        poster?: string;
    }[]) => void), callback?: (result: {
        url: string;
        bucketName: string;
        objectKey: string;
        type: 'IMAGE' | 'AUDIO' | 'VIDEO';
        width?: number;
        height?: number;
        duration?: number;
        poster?: string;
    }[]) => void): void;
    /**
     * 唤起云相册
     * chooseCloudMediaSelector
     */
    chooseCloudMediaSelector(options: {
        babyId?: string;
        gradeId?: string;
        accept?: 'IMAGE' | 'VIDEO';
        count?: number;
        selected?: any[];
    }, callback?: (result: any) => void): void;
    /**
     * chooseMediaPreviewer
     * 打开多媒体文件播放器，目前不支持视频图片混合播放，所以取urls[0]['type']
     */
    chooseMediaPreviewer(options: {
        current?: number;
        type?: 'IMAGE' | 'VIDEO';
        urls: {
            type?: 'IMAGE' | 'VIDEO';
            url: string;
            cover?: string;
            width?: number;
            height?: number;
        }[];
    }): void;
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
    shareAppMessage(options: {
        title: string;
        desc?: string;
        link?: string;
        imgUrl?: string;
        shareType?: 'TIMELINE' | 'FRIEND' | 'IM';
        shareMenus?: ('TIMELINE' | 'FRIEND' | 'IM')[];
        bizType?: 'PICTUREBOOK' | 'ALBUM';
    }, callback?: (result?: 'TIMELINE' | 'FRIEND' | 'IM' | 'CANCEL') => void): void;
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
    shareImageFile(options: {
        imgUrl: string;
        shareType?: 'TIMELINE' | 'FRIEND';
        shareMenus?: ('TIMELINE' | 'FRIEND')[];
    }, callback?: (result?: 'TIMELINE' | 'FRIEND' | 'CANCEL') => void): void;
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
    shareMiniAppMessage(options: {
        title: string;
        desc: string;
        link: string;
        imgUrl?: string;
        ghId: string;
    }, callback?: (result?: 'TIMELINE' | 'FRIEND' | 'IM' | 'CANCEL') => void): void;
    /**
     * sharePosterMessage
     * 分享海报，海报由服务端生成
     * @param {object} options
     * @options {string} bizType 业务类型
     * @options {string} targetId 业务类型对应的id
     * @options {string} bizContent 业务内容
     */
    sharePosterMessage(options: {
        bizType: 'FEED' | 'DOOLUU' | 'PRODUCT' | 'SHOP' | 'LIVE';
        targetId: string | number;
        bizContent?: string;
    }): void;
    /**
     * shareToFeed
     * @param options
     * @param callback
     */
    shareToFeed(options: {
        title: string;
        desc?: string;
        imgUrl?: string;
        link?: string;
        bizType?: string;
        target?: 'SCHOOL' | 'GRADE' | 'BABY' | 'INSTITUTION';
        targetId?: string;
        targetGroups?: ('SCHOOL' | 'GRADE' | 'BABY' | 'INSTITUTION')[];
    }, callback?: (result: boolean) => void): void;
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
    chooseCashier(options: {
        orderNo: string;
        redirect?: string;
    }, callback?: (result: {
        status: 'SUCCESS' | 'FAIL' | 'CANCEL';
        message?: string;
    }) => void): void;
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
    choosePay(options: {
        orderNo: string;
        channel: 'DOOLUU' | 'ALIPAY' | 'WECHAT' | 'BANK_TRANSFER';
        redirect?: string;
    }, callback?: (result: {
        status: 'SUCCESS' | 'CANCEL' | 'FAIL' | 'CLOSE' | 'UNKNOW';
        message?: string;
    }) => void): void;
    /**
     * copy2Clipboard
     * 复制图片到剪切板，辅助文案请使用js
     * @param {string} url 需要辅助的图片的url
     */
    copy2Clipboard(content: string): void;
    /**
     * chooseClipboardListener
     * 唤起链接识别监听器
     * @param {function} callback 识别到链接，并且点击确定后回调链接内容
     */
    chooseClipboardListener(callback?: (result: {
        type: 'LINK';
        icon?: string;
        link: string;
        title: string;
        description?: string;
    }) => void): void;
    /**
     * chooseHpplay
     * 唤起投屏功能
     * IOS并不支持，请使用airplay
     * @param {function} callback 投屏/结束投屏后的回调，并且返回投屏状态
     */
    chooseHpplay(callback?: (result: boolean) => void): void;
    /**
     * 预览亲子打卡模板
     * previewPunchTemplate
     */
    choosePunchTemplatePreview(options: {
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
    }): void;
    /**
     * 填充亲子打卡模板
     * fillPunchFromTemplate
     */
    fillPunchTemplate(options: {
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
    }): void;
    /**
     * fillFromTemplate
     * 选择模板回填客户端
     * @param options
     */
    fillFromTemplate(options: {
        type: 'FEED' | 'WISHES';
        data: string;
    }): void;
    /**
     * 成长相册预览页面打印按钮调用端弹框
     * growthAlbumPrint
     * @param options
     */
    choosegGrowthAlbumPrint(options: {
        growthAlbumId: string;
        spuId: string;
    }): void;
    /**
     * 唤醒客户端相册一键提醒分享
     * growthAlbumRemind
     * @param {object} options
     * @options {string} growthAlbumId 成长册id
     * @options {termId} 学期id
     * @options {gradeId} gradeId 班级id
     */
    chooseGrowthAlbumRemind(options: {
        growthAlbumId: string;
        termId: string;
        gradeId: string;
    }): void;
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
    chooseMap(options?: {
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
    }) => void): void;
}
export default function (): JSBridge;
