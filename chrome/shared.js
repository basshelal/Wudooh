/**
 * This file contains common shared code that is used by all three main TypeScript files
 * These are background.ts, main.ts, and popup.ts.
 *
 * This trick is done by loading this script before any others when they are requested and
 * then adding the following line at the top of the file for support from WebStorm IDE.
 * ///<reference path="./shared.ts"/>
 */
// Declare Browser APIs
const runtime = chrome.runtime;
/** The font size percent, between 100 and 300 */
const keyTextSize = "textSize";
/** The line height percent, between 100 and 300 */
const keyLineHeight = "lineHeight";
/** Determines whether the extension is on or off, true is on */
const keyOnOff = "onOff";
/** The font to update to, this is a string */
const keyFont = "font";
/** The array of strings of whitelisted websites, this contains their hostnames in the format example.com */
const keyWhitelisted = "whitelisted";
/** The array of {@linkcode CustomSettings} that represents the sites with custom settings */
const keyCustomSettings = "customSettings";
/** The array of {@linkcode CustomFont}s, this is used in {@linkcode chrome.storage.local} */
const keyCustomFonts = "customFonts";
/** The keys of the {@linkcode chrome.storage.sync} */
const keys = [
    keyTextSize,
    keyLineHeight,
    keyOnOff,
    keyFont,
    keyWhitelisted,
    keyCustomSettings,
    keyCustomFonts
];
// Defaults
const defaultFont = "Droid Arabic Naskh";
const defaultTextSize = 125;
const defaultLineHeight = 145;
const defaultColor = "#880E4F";
const homePage = "http://basshelal.github.io/Wudooh";
// Message Reasons
const reasonUpdateAllText = "updateAllText";
const reasonInjectCustomFonts = "injectCustomFonts";
const reasonToggleOff = "toggleOff";
let htmlEditables = ["textarea", "input", "text", "email", "number", "search", "tel", "url", "password"];
const allWudoohFonts = [
    "Droid Arabic Naskh",
    "Noto Naskh Arabic",
    "Arabic Typesetting",
    "Simplified Arabic",
    "Traditional Arabic",
    "Noto Sans Arabic",
    "Noto Kufi Arabic",
    "Aldhabi",
    "Amiri",
    "Amiri Quran",
    "Andalus",
    "Reem Kufi Regular",
    "Scheherazade",
    "Urdu Typesetting",
    "Noto Nastaliq Urdu",
    "Aref Ruqaa",
    "Cairo",
    "Lemonada",
    "Lalezar",
    "Tajawal",
    "Changa",
    "El Messiri",
    "Lateef",
    "Mada",
    "Markazi Text",
    "Mirza",
    "Harmattan",
    "Rakkas",
    "Katibeh",
    "Jomhuria",
    "Shakstah",
    "Mehr Nastaliq",
    "Rooznameh",
    "DecoType Naskh",
    "sans-serif",
    "Times New Roman",
    "Arial",
    "Calibri",
    "Original"
];
/**
 * Represents a site that uses different settings from the global settings
 * The settings themselves may be the same as the global but they will change independently
 */
class CustomSettings {
    constructor(url, textSize, lineHeight, font) {
        this.url = url;
        this.textSize = textSize;
        this.lineHeight = lineHeight;
        this.font = font;
    }
    static isValidCustomSettings(customSettings) {
        const url = customSettings.url;
        const textSize = customSettings.textSize;
        const lineHeight = customSettings.lineHeight;
        const font = customSettings.font;
        return !!url && typeof url === "string" &&
            !!textSize && typeof textSize === "number" && textSize >= 100 && textSize <= 300 &&
            !!lineHeight && typeof lineHeight === "number" && lineHeight >= 100 && lineHeight <= 300 &&
            !!font && typeof font === "string";
    }
    static isCustomSettings(obj) {
        return !!obj && obj.hasOwnProperty("url") && obj.hasOwnProperty("textSize") &&
            obj.hasOwnProperty("lineHeight") && obj.hasOwnProperty("font") &&
            this.isValidCustomSettings(obj);
    }
    static isCustomSettingsArray(array) {
        return array.length === 0 || array.every((obj) => this.isCustomSettings(obj));
    }
}
class CustomFont {
    constructor(fontName, localName, url) {
        this.fontName = fontName;
        this.localName = localName;
        this.url = url;
    }
    /**
     * Trick to make sure that a font is installed on the client's machine.
     * I found this somewhere online and they claimed it works 99% of the time,
     * it's worked perfectly for me so far
     */
    static isFontInstalled(font) {
        var container = document.createElement('span');
        container.innerHTML = Array(100).join('wi');
        container.style.cssText = [
            'position:absolute',
            'width:auto',
            'font-size:128px',
            'left:-99999px'
        ].join(' !important;');
        function getWidth(fontFamily) {
            container.style.fontFamily = fontFamily;
            document.body.appendChild(container);
            let width = container.clientWidth;
            document.body.removeChild(container);
            return width;
        }
        // Pre compute the widths of monospace, serif & sans-serif
        // to improve performance.
        var monoWidth = getWidth('monospace');
        var serifWidth = getWidth('serif');
        var sansWidth = getWidth('sans-serif');
        return monoWidth !== getWidth(font + ',monospace') ||
            sansWidth !== getWidth(font + ',sans-serif') ||
            serifWidth !== getWidth(font + ',serif');
    }
    static isFontUrlValid(fontUrl) {
        return fetch(fontUrl).then(response => response.ok);
    }
    isFontInstalled() {
        return CustomFont.isFontInstalled(this.fontName);
    }
    isUrlValid() {
        if (!this.url)
            return Promise.resolve(false);
        if (this.url)
            return CustomFont.isFontUrlValid(this.url);
    }
    static isValidCustomFont(customFont) {
        const fontName = customFont.fontName;
        const localName = customFont.localName;
        const url = customFont.url;
        return !!fontName && typeof fontName === "string" &&
            !!localName && typeof localName === "string" &&
            !!url && typeof url === "string";
    }
    static isCustomFont(obj) {
        return !!obj && obj.hasOwnProperty("fontName") && obj.hasOwnProperty("localName") &&
            obj.hasOwnProperty("url") &&
            this.isValidCustomFont(obj);
    }
    static isCustomFontsArray(array) {
        return array.length === 0 || array.every((obj) => this.isCustomFont(obj));
    }
}
/**
 * An abstraction and simplification of the storage.sync API to make it use Promises
 */
var sync = {
    async get(keys = null) {
        return new Promise(resolve => {
            chrome.storage.sync.get(keys, storage => resolve(storage));
        });
    },
    async set(wudoohStorage) {
        return new Promise(resolve => chrome.storage.sync.set(wudoohStorage, () => resolve()));
    }
};
/**
 * An abstraction and simplification of the tabs API to make it use Promises
 */
var tabs = {
    async create(url) {
        return new Promise(resolve => chrome.tabs.create({ url: url }, tab => resolve(tab)));
    },
    async queryAllTabs() {
        return new Promise(resolve => chrome.tabs.query({}, (tabs) => resolve(tabs)));
    },
    async queryCurrentTab() {
        return new Promise(resolve => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs)));
    },
    sendMessage(tabId, message) {
        chrome.tabs.sendMessage(tabId, message);
    }
};
/**
 * Shorthand for {@linkcode document.getElementById}, automatically casts to T, a HTMLElement
 *
 * @param elementId the id of the element to get
 */
function get(elementId) {
    return document.getElementById(elementId);
}
function wait(millis, func) {
    return setTimeout(func, millis);
}
Array.prototype.contains = function (element) {
    return this.indexOf(element) !== -1;
};
String.prototype.contains = function (string) {
    return this.indexOf(string) !== -1;
};
Element.prototype.postDelayed = function (millis, func) {
    let localTask = wait(millis, () => {
        if (localTask === this.currentTask)
            func.call(this);
    });
    this.currentTask = localTask;
};
// endregion Extensions
