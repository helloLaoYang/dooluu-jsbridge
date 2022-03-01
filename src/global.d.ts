
interface Window {
  WebViewJavascriptBridge: any;
  WVJBCallbacks: any;
  __wxjs_environment?: 'miniprogram';
  wx: any;
  DOOLUU_BRIDGE_CONTEXT: any;
  DOOLUU_BRIDGE: any;
}

declare module 'dooluu-common/utils' {
  export const isVersionLessThan: (currentVersion: string, targatVersion: string) => boolean;
}
