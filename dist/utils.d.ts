/**
 * randomString
 * 生成一个不重复的字符串，如果重复就会造成死循环
 * @parpm length 随机字符串的长度
 */
export declare const randomString: (length?: number | undefined) => string;
export declare const setupWebViewJavascriptBridge: (callback: (result: any) => void) => void;
export declare const mountScript: (url: string, callback?: ((error?: Error | undefined) => void) | undefined) => void;
