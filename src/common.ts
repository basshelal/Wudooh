/**
 * This file contains common shared code that is used by all three main TypeScript files
 * These are background.ts, main.ts, and popup.ts.
 *
 * This trick is done by loading this script before any others when they are requested
 */

import {extensions} from "./extensions"

extensions()

// Import Types
export type Tab = chrome.tabs.Tab | browser.tabs.Tab

export type WudoohKeysType =
    "textSize" |
    "lineHeight" |
    "onOff" |
    "font" |
    "whitelisted" |
    "customSettings" |
    "customFonts"

export interface WudoohKeysInterface {
    textSize: WudoohKeysType;
    customSettings: WudoohKeysType;
    customFonts: WudoohKeysType;
    lineHeight: WudoohKeysType;
    whitelisted: WudoohKeysType;
    onOff: WudoohKeysType;
    font: WudoohKeysType;
    all(): Array<WudoohKeysType>
}

export const WudoohKeys: WudoohKeysInterface = {
    /** The font size percent, between 100 and 300 */
    textSize: "textSize",
    /** The line height percent, between 100 and 300 */
    lineHeight: "lineHeight",
    /** Determines whether the extension is on or off, true is on */
    onOff: "onOff",
    /** The font to update to, this is a string */
    font: "font",
    /** The array of strings of whitelisted websites, this contains their hostnames in the format example.com */
    whitelisted: "whitelisted",
    /** The array of {@linkcode CustomSettings} that represents the sites with custom settings */
    customSettings: "customSettings",
    /** The array of {@linkcode CustomFont}s, this is used in {@linkcode chrome.storage.local} */
    customFonts: "customFonts",
    /** All keys in this object in an array */
    all(): Array<WudoohKeysType> {
        return [
            WudoohKeys.textSize,
            WudoohKeys.lineHeight,
            WudoohKeys.onOff,
            WudoohKeys.font,
            WudoohKeys.whitelisted,
            WudoohKeys.customSettings,
            WudoohKeys.customFonts
        ]
    }
}

export const defaultDelay: number = 250

export type MessageReasonType = "updateAllText" | "injectCustomFonts" | "toggleOff"

export const MessageReasons = new (class {
    public updateAllText: MessageReasonType = "updateAllText"
    public injectCustomFonts: MessageReasonType = "injectCustomFonts"
    public toggleOff: MessageReasonType = "toggleOff"
})()

export interface Message {
    reason: MessageReasonType,
    data?: any
}

export type Browser = "chrome" | "firefox" | "edge" | "opera"

export const browserName: Browser | null = ((): Browser | null => {
    const agent: string = navigator.userAgent.toLowerCase()
    if (agent.includes("firefox")) return "firefox"
    if (agent.includes("edg")) return "edge"
    if (agent.includes("opr") || agent.includes("opera")) return "opera"
    if (agent.includes("chrome")) return "chrome"
    return null
})()

export const isChromium: boolean = ((): boolean => {
    return browserName === "chrome" || browserName === "edge" || browserName === "opera"
})()

/**
 * Represents a site that uses different settings from the global settings
 * The settings themselves may be the same as the global but they will change independently
 */
export class CustomSetting {
    /** The hostname url of this web site */
    url: string
    /** The font size percent to use on this site */
    textSize: number
    /** The line height percent to use on this site */
    lineHeight: number
    /** The font to use on this site */
    font: string

    constructor(url: string, textSize: number,
                lineHeight: number, font: string) {
        this.url = url
        this.textSize = textSize
        this.lineHeight = lineHeight
        this.font = font
    }

    static isValidCustomSetting(customSettings: CustomSetting): boolean {
        const url: string = customSettings.url
        const textSize: number = customSettings.textSize
        const lineHeight: number = customSettings.lineHeight
        const font: string = customSettings.font

        return !!url && typeof url === "string" &&
            !!textSize && typeof textSize === "number" && textSize >= 100 && textSize <= 300 &&
            !!lineHeight && typeof lineHeight === "number" && lineHeight >= 100 && lineHeight <= 300 &&
            !!font && typeof font === "string"
    }

    static isCustomSetting(obj: any): boolean {
        return !!obj && obj.hasOwnProperty("url") && obj.hasOwnProperty("textSize") &&
            obj.hasOwnProperty("lineHeight") && obj.hasOwnProperty("font") &&
            this.isValidCustomSetting(obj as CustomSetting)
    }

    static isCustomSettingsArray(array: Array<any>): boolean {
        return array.length === 0 || array.every((obj: any) => this.isCustomSetting(obj))
    }
}

// TODO: This can be simplified to name and url which may be a localName since they both serve the same purpose and
//  only 1 is needed
export class CustomFont {

    fontName: string

    localName: string

    url: string

    constructor(fontName: string, localName: string, url: string) {
        this.fontName = fontName
        this.localName = localName
        this.url = url
    }

    static injectCSS(font: CustomFont): string {
        const stringArray: Array<string> = []
        stringArray.push(`@font-face { font-family: '${font.fontName}';`)
        if (font.url || font.localName) stringArray.push(`src: `)

        if (font.url && font.localName) stringArray.push(`local('${font.localName}'), url('${font.url}');}\n`)
        else if (font.localName && !font.url) stringArray.push(`local('${font.localName}');}\n`)
        else if (font.url && !font.localName) stringArray.push(`url('${font.url}');}\n`)
        return stringArray.join("")
    }

    /**
     * Trick to make sure that a font is installed on the client's machine.
     * I found this somewhere online and they claimed it works 99% of the time,
     * it's worked perfectly for me so far
     */
    static isFontInstalled(font: string): boolean {
        var container = document.createElement("span")
        container.innerHTML = Array(100).join("wi")
        container.style.cssText = [
            "position:absolute",
            "width:auto",
            "font-size:128px",
            "left:-99999px"
        ].join(" !important;")

        function getWidth(fontFamily: string) {
            container.style.fontFamily = fontFamily
            document.body.appendChild(container)
            let width = container.clientWidth
            document.body.removeChild(container)
            return width
        }

        // Pre compute the widths of monospace, serif & sans-serif
        // to improve performance.
        var monoWidth = getWidth("monospace")
        var serifWidth = getWidth("serif")
        var sansWidth = getWidth("sans-serif")

        return monoWidth !== getWidth(font + ",monospace") ||
            sansWidth !== getWidth(font + ",sans-serif") ||
            serifWidth !== getWidth(font + ",serif")
    }

    static async isFontUrlValid(url: string): Promise<boolean> {
        return fetch(url).then(response => response.ok).catch(() => false)
    }

    // TODO this doesn't actually check if the font is readable, if the font is broken it will silently fail
    //  example of broken font: https://arbfonts.com/font_files/reqa3/symbol/MCS%20Rikaa%20E_U%20normal..ttf
    //  I can't figure out a way to fix this at all!
    static async isFontValid(customFont: CustomFont): Promise<boolean> {
        let isFontInstalled: boolean = true
        let isFontUrlValid: boolean = true
        if (customFont.localName) isFontInstalled = CustomFont.isFontInstalled(customFont.localName)
        if (customFont.url) isFontUrlValid = (await CustomFont.isFontUrlValid(customFont.url))
        return isFontInstalled && isFontUrlValid
    }

    static isValidCustomFont(font: CustomFont): boolean {
        const fontName: string = font.fontName
        const localName: string = font.localName
        const url: string = font.url

        return !!fontName && typeof fontName === "string" &&
            !!localName && typeof localName === "string" &&
            !!url && typeof url === "string"
    }

    static isCustomFont(obj: any): boolean {
        return !!obj && obj.hasOwnProperty("fontName") && obj.hasOwnProperty("localName") &&
            obj.hasOwnProperty("url") &&
            this.isValidCustomFont(obj as CustomFont)
    }

    static isCustomFontsArray(array: Array<any>): boolean {
        return array.length === 0 || array.every((obj: any) => this.isCustomFont(obj))
    }
}

/**
 * Represents the storage that Wudooh uses.
 * This adds type and key safety to any storage modifications.
 */
export interface WudoohStorage {
    /*readonly*/
    textSize?: number;
    /*readonly*/
    lineHeight?: number;
    /*readonly*/
    onOff?: boolean;
    /*readonly*/
    font?: string;
    /*readonly*/
    whitelisted?: Array<string>;
    /*readonly*/
    customSettings?: Array<CustomSetting>;
    /*readonly*/
    customFonts?: Array<CustomFont>;
}

export const DefaultWudoohStorage: WudoohStorage = {
    textSize: 125,
    lineHeight: 145,
    onOff: true,
    font: "Sahl Naskh",
    whitelisted: [],
    customSettings: [],
    customFonts: []
}

export const runtime: (typeof chrome.runtime | typeof browser.runtime) = (() => isChromium ? chrome.runtime : browser.runtime)()

// TODO: Below abstractions can be fully Promise calling if using MV3

/**
 * An abstraction and simplification of the storage.sync API to make it use Promises
 */
export const sync = {
    async get(keys: Array<WudoohKeysType> | WudoohKeysType): Promise<WudoohStorage> {
        return new Promise<WudoohStorage>(resolve => {
            if (isChromium) chrome.storage.sync.get(keys, storage => resolve(storage as WudoohStorage))
            else browser.storage.sync.get(keys).then(storage => resolve(storage as WudoohStorage))
        })
    },
    async set(wudoohStorage: WudoohStorage): Promise<void> {
        return new Promise<void>(resolve => {
            if (isChromium) chrome.storage.sync.set(wudoohStorage, () => resolve())
            else browser.storage.sync.set(wudoohStorage).then(() => resolve())
        })
    },
    onChanged(callback: (changedKeys: Array<keyof WudoohStorage>, oldStorage: WudoohStorage, newStorage: WudoohStorage) => void): void {
        if (isChromium) {
            const listener = (changes: { [p: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName): void => {
                if (areaName === "sync") {
                    const keysChanged: Array<keyof WudoohStorage> = []
                    const oldStorage: any = {}
                    const newStorage: any = {}
                    for (const changesKey in changes) {
                        if (DefaultWudoohStorage.hasOwnProperty(changesKey)) {
                            keysChanged.push(changesKey as keyof WudoohStorage)
                            oldStorage[changesKey] = changes[changesKey].oldValue
                            newStorage[changesKey] = changes[changesKey].newValue
                        }
                    }
                    if (keysChanged.length > 0) {
                        callback(keysChanged, oldStorage as WudoohStorage, newStorage as WudoohStorage)
                    }
                }
            }
            if (!chrome.storage.onChanged.hasListener(listener)) {
                chrome.storage.onChanged.addListener(listener)
            }
        } else {
            browser.storage.onChanged.addListener((changes: { [p: string]: browser.storage.StorageChange }, areaName: string): void => {
                // TODO: Implement!
            })
        }
    }
}

/**
 * An abstraction and simplification of the tabs API to make it use Promises
 */
export const tabs = {
    async create(url: string): Promise<Tab> {
        return new Promise<Tab>(resolve => {
            if (isChromium) chrome.tabs.create({url: url}, tab => resolve(tab))
            else browser.tabs.create({url: url}).then(tab => resolve(tab))
        })
    },
    async queryAllTabs(): Promise<Array<Tab>> {
        return new Promise<Array<Tab>>(resolve => {
            if (isChromium) chrome.tabs.query({}, tabs => resolve(tabs))
            else browser.tabs.query({}).then(tabs => resolve(tabs))
        })
    },
    async queryCurrentTab(): Promise<Array<Tab>> {
        return new Promise<Array<Tab>>(resolve => {
            if (isChromium) chrome.tabs.query({active: true, currentWindow: true}, tabs => resolve(tabs))
            else browser.tabs.query({active: true, currentWindow: true}).then(tabs => resolve(tabs))
        })
    },
    sendMessage(tabId: number, message: Message): void {
        if (isChromium) chrome.tabs.sendMessage(tabId, message)
        else browser.tabs.sendMessage(tabId, message)
    },
    async sendMessageAllTabs(message: Message): Promise<void> {
        (await this.queryAllTabs()).forEach((tab: Tab): void => {
            if (!!tab.id) {
                tabs.sendMessage(tab.id, message)
            }
        })
    }
}

export const log = {
    e: console.error,
    w: console.warn,
    i: console.info,
    d: console.log,
    v: console.debug
}

/**
 * This Arabic regex allows and accepts any non Arabic symbols next to Arabic symbols,
 * this means that it accepts anything as long as it has some Arabic symbol in it
 */
export const arabicRegex: RegExp = new RegExp("[\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\]+([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\\W\\d]+)*", "g")

/**
 * Returns whether the given node has any Arabic script or not, this is any script that matches arabicRegEx.
 * `true` if it does and false otherwise
 */
export function hasArabicScript(node: Node): boolean {
    return !!node.nodeValue && !!(node.nodeValue.match(arabicRegex))
}

export async function injectCustomFonts(customFonts: Array<CustomFont>): Promise<Array<CustomFont>> {
    let customFontsStyle: HTMLElement | null = get("wudoohCustomFontsStyle")
    if (!!customFontsStyle) {
        customFontsStyle.textContent = ""
        document.head.removeChild(customFontsStyle)
        customFontsStyle = null
    }
    customFontsStyle = document.createElement("style")
    customFontsStyle.id = "wudoohCustomFontsStyle"
    customFonts.forEach((customFont: CustomFont): void => {
        if (!!customFontsStyle && !!customFontsStyle.textContent) {
            customFontsStyle.textContent = customFontsStyle.textContent.concat(CustomFont.injectCSS(customFont))
        }
    })
    document.head.append(customFontsStyle)
    return customFonts
}

/**
 * Shorthand for {@linkcode document.getElementById}, automatically casts to T, a HTMLElement
 *
 * @param elementId the id of the element to get
 */
export function get<T extends HTMLElement>(elementId: string): T | null {
    return document.getElementById(elementId) as T | null
}

export function wait(millis: number, func: Function): number {
    return setTimeout(func, millis)
}

export function onDOMContentLoaded(listener: EventListenerOrEventListenerObject) {
    document.addEventListener("DOMContentLoaded", listener)
}

export function onDOMContentLoadedDelayed(delay: number, listener: EventListenerOrEventListenerObject) {
    onDOMContentLoaded(() => wait(delay, () => listener))
}

export function randomColor(): string {
    return "#" + Math.floor(Math.random() * 16777215).toString(16)
}

/**
 * Checks whether the passed in node is editable or not, `true` if editable, `false` otherwise
 * These will generally need to be ignored to avoid any conflicts with the site or the user's formatting
 */
export function isNodeEditable(node: Node): boolean {
    if (!!node && node instanceof HTMLElement && node.nodeType === Node.ELEMENT_NODE) {
        const htmlEditables: Array<string> = ["textarea", "input"]
        const tagName: string = node.tagName.toLowerCase()
        // TODO: Should we include isContentEditable?? This can be true on non text inputs such as any formatted
        //  input text such as an email form for example
        return node.isContentEditable || htmlEditables.contains(tagName)
    } else return false
}

export function now(): number {return Date.now()}

export function nowString(): string {return new Date().toISOString()}

export async function getAllWudoohFonts(): Promise<Array<CustomFont>> {

    const response: Response = await fetch("https://raw.githubusercontent.com/basshelal/Wudooh/master/fonts/fonts.json")
    if (response.ok) {
        const fonts = response.json() as unknown as Array<{ name: string, location: string }>
    }
    // TODO: See if we can have all fonts fetched from a server (like Github) so that we can add and remove fonts
    //  without extension updates, this makes the extension size significantly smaller too since we don't have to
    //  bundle with all the fonts, the only issue is the need for internet, though that should generally be the case
    //  on a browser no?
    return []
}