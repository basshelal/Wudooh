/**
 * This file contains common shared code that is used by all three main TypeScript files
 * These are background.ts, main.ts, and popup.ts.
 *
 * This trick is done by loading this script before any others when they are requested and
 * then adding the following line at the top of the file for support from WebStorm IDE.
 * ///<reference path="./shared.ts"/>
 */

// Import Types
// noinspection ES6UnusedImports
import Tab = chrome.tabs.Tab;
// noinspection ES6UnusedImports
import InstalledDetails = chrome.runtime.InstalledDetails;

// Declare Browser APIs
const runtime = chrome.runtime;

/** The font size percent, between 100 and 300 */
const keyTextSize: string = "textSize";

/** The line height percent, between 100 and 300 */
const keyLineHeight: string = "lineHeight";

/** Determines whether the extension is on or off, true is on */
const keyOnOff: string = "onOff";

/** The font to update to, this is a string */
const keyFont: string = "font";

/** The array of strings of whitelisted websites, this contains their hostnames in the format example.com */
const keyWhitelisted: string = "whitelisted";

/** The array of {@linkcode CustomSettings} that represents the sites with custom settings */
const keyCustomSettings: string = "customSettings";

/** The array of {@linkcode CustomFont}s, this is used in {@linkcode chrome.storage.local} */
const keyCustomFonts: string = "customFonts";

/** The keys of the {@linkcode chrome.storage.sync} */
const keys: Array<string> = [
    keyTextSize,
    keyLineHeight,
    keyOnOff,
    keyFont,
    keyWhitelisted,
    keyCustomSettings,
    keyCustomFonts
];

// Defaults
const defaultFont: string = "Droid Arabic Naskh";
const defaultTextSize: number = 115;
const defaultLineHeight: number = 125;
const defaultColor: string = "#880E4F";
const homePage: string = "http://basshelal.github.io/Wudooh";

// Message Reasons
const reasonUpdateAllText = "updateAllText";
const reasonInjectCustomFonts = "injectCustomFonts";
const reasonToggleOnOff = "toggleOnOff";

let htmlEditables = ["textarea", "input", "text", "email", "number", "search", "tel", "url", "password"];

const allWudoohFonts: Array<string> = [
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
    /** The hostname url of this web site */
    url: string;
    /** The font size percent to use on this site */
    textSize: number;
    /** The line height percent to use on this site */
    lineHeight: number;
    /** The font to use on this site */
    font: string;

    constructor(url: string, textSize: number,
                lineHeight: number, font: string) {
        this.url = url;
        this.textSize = textSize;
        this.lineHeight = lineHeight;
        this.font = font;
    }

    static isValidCustomSettings(customSettings: CustomSettings): boolean {
        const url: string = customSettings.url;
        const textSize: number = customSettings.textSize;
        const lineHeight: number = customSettings.lineHeight;
        const font: string = customSettings.font;

        return !!url && typeof url === "string" &&
            !!textSize && typeof textSize === "number" && textSize >= 100 && textSize <= 300 &&
            !!lineHeight && typeof lineHeight === "number" && lineHeight >= 100 && lineHeight <= 300 &&
            !!font && typeof font === "string";
    }

    static isCustomSettings(obj: object): boolean {
        return !!obj && obj.hasOwnProperty("url") && obj.hasOwnProperty("textSize") &&
            obj.hasOwnProperty("lineHeight") && obj.hasOwnProperty("font") &&
            this.isValidCustomSettings(obj as CustomSettings);
    }

    static isCustomSettingsArray(array: Array<any>): boolean {
        return array.length === 0 || array.every((obj: object) => this.isCustomSettings(obj));
    }
}

class CustomFont {

    fontName: string;

    localName: string;

    url: string;

    constructor(fontName: string, localName: string, url: string) {
        this.fontName = fontName;
        this.localName = localName;
        this.url = url;
    }

    /**
     * Trick to make sure that a font is installed on the client's machine.
     * I found this somewhere online and they claimed it works 99% of the time,
     * it's worked perfectly for me so far
     */
    static isFontInstalled(font: string): boolean {
        var container = document.createElement('span');
        container.innerHTML = Array(100).join('wi');
        container.style.cssText = [
            'position:absolute',
            'width:auto',
            'font-size:128px',
            'left:-99999px'
        ].join(' !important;');

        function getWidth(fontFamily: string) {
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

    static isFontUrlValid(fontUrl: string): Promise<boolean> {
        return fetch(fontUrl).then(response => response.ok);
    }

    isFontInstalled(): boolean {
        return CustomFont.isFontInstalled(this.fontName);
    }

    isUrlValid(): Promise<boolean> {
        if (!this.url) return Promise.resolve(false);
        if (this.url) return CustomFont.isFontUrlValid(this.url);
    }
}

/**
 * Represents the storage that Wudooh uses.
 * This adds type and key safety to any storage modifications.
 */
interface WudoohStorage {
    readonly textSize?: number;
    readonly lineHeight?: number;
    readonly onOff?: boolean;
    readonly font?: string;
    readonly whitelisted?: Array<string>;
    readonly customSettings?: Array<CustomSettings>;
    readonly customFonts?: Array<CustomFont>;
}

/**
 * An abstraction and simplification of the storage.sync API to make it use Promises
 */
var sync = {
    get(keys: Array<string> = null): Promise<WudoohStorage> {
        return new Promise<WudoohStorage>(resolve => {
            chrome.storage.sync.get(keys, storage => resolve(storage as WudoohStorage));
        });
    },
    set(wudoohStorage: WudoohStorage): Promise<void> {
        return new Promise<void>(resolve => chrome.storage.sync.set(wudoohStorage, () => resolve()));
    }
};

/**
 * An abstraction and simplification of the tabs API to make it use Promises
 */
var tabs = {
    create(url: string): Promise<Tab> {
        return new Promise<Tab>(resolve =>
            chrome.tabs.create({url: url}, tab => resolve(tab)));
    },
    queryAllTabs(): Promise<Array<Tab>> {
        return new Promise<Array<Tab>>(resolve =>
            chrome.tabs.query({}, (tabs: Array<Tab>) => resolve(tabs))
        );
    },
    queryCurrentTab(): Promise<Array<Tab>> {
        return new Promise<Array<Tab>>(resolve =>
            chrome.tabs.query({active: true, currentWindow: true},
                (tabs: Array<Tab>) => resolve(tabs)));
    },
    sendMessage(tabId: number, message: any) {
        chrome.tabs.sendMessage(tabId, message);
    }
};

/**
 * Shorthand for {@linkcode document.getElementById}, automatically casts to T, a HTMLElement
 *
 * @param elementId the id of the element to get
 */
function get<T extends HTMLElement>(elementId: string): T | null {
    return document.getElementById(elementId) as T
}

function wait(millis: number, func: Function): number {
    return setTimeout(func, millis);
}

// region Extensions

interface Array<T> {
    contains(element: T): boolean;
}

Array.prototype.contains = function <T>(element: T): boolean {
    return this.indexOf(element) !== -1;
};

interface String {
    contains(string: string): boolean
}

String.prototype.contains = function (string: string) {
    return this.indexOf(string) !== -1;
};

interface Element {
    currentTask: number;

    postDelayed(millis: number, func: Function);
}

Element.prototype.postDelayed = function (millis: number, func: Function) {
    let localTask = wait(millis, () => {
        if (localTask === this.currentTask) func.call(this);
    });
    this.currentTask = localTask;
};

// endregion Extensions