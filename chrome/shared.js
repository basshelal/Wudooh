/**
 * This file contains common shared code that is used by all three main TypeScript files
 * These are background.ts, main.ts, and popup.ts.
 *
 * This trick is done by loading this script before any others when they are requested and
 * then adding the following line at the top of the file for support from WebStorm IDE.
 * ///<reference path="./shared.ts"/>
 */
// Declare Browser APIs
var runtime = chrome.runtime;
/** The font size percent, between 100 and 300 */
var keyTextSize = "textSize";
/** The line height percent, between 100 and 300 */
var keyLineHeight = "lineHeight";
/** Determines whether the extension is on or off, true is on */
var keyOnOff = "onOff";
/** The font to update to, this is a string */
var keyFont = "font";
/** The array of strings of whitelisted websites, this contains their hostnames in the format example.com */
var keyWhitelisted = "whitelisted";
/** The array of {@linkcode CustomSettings} that represents the sites with custom settings */
var keyCustomSettings = "customSettings";
/** The array of {@linkcode CustomFont}s, this is used in {@linkcode chrome.storage.local} */
var keyCustomFonts = "customFonts";
/** The keys of the {@linkcode chrome.storage.sync} */
var keys = [
    keyTextSize,
    keyLineHeight,
    keyOnOff,
    keyFont,
    keyWhitelisted,
    keyCustomSettings,
    keyCustomFonts
];
// Defaults
var defaultFont = "Droid Arabic Naskh";
var defaultTextSize = 125;
var defaultLineHeight = 145;
var defaultColor = "#880E4F";
var homePage = "http://basshelal.github.io/Wudooh";
// Message Reasons
var reasonUpdateAllText = "updateAllText";
var reasonInjectCustomFonts = "injectCustomFonts";
var reasonToggleOff = "toggleOff";
var htmlEditables = ["textarea", "input", "text", "email", "number", "search", "tel", "url", "password"];
var allWudoohFonts = [
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
var CustomSettings = /** @class */ (function () {
    function CustomSettings(url, textSize, lineHeight, font) {
        this.url = url;
        this.textSize = textSize;
        this.lineHeight = lineHeight;
        this.font = font;
    }
    CustomSettings.isValidCustomSettings = function (customSettings) {
        var url = customSettings.url;
        var textSize = customSettings.textSize;
        var lineHeight = customSettings.lineHeight;
        var font = customSettings.font;
        return !!url && typeof url === "string" &&
            !!textSize && typeof textSize === "number" && textSize >= 100 && textSize <= 300 &&
            !!lineHeight && typeof lineHeight === "number" && lineHeight >= 100 && lineHeight <= 300 &&
            !!font && typeof font === "string";
    };
    CustomSettings.isCustomSettings = function (obj) {
        return !!obj && obj.hasOwnProperty("url") && obj.hasOwnProperty("textSize") &&
            obj.hasOwnProperty("lineHeight") && obj.hasOwnProperty("font") &&
            this.isValidCustomSettings(obj);
    };
    CustomSettings.isCustomSettingsArray = function (array) {
        var _this = this;
        return array.length === 0 || array.every(function (obj) { return _this.isCustomSettings(obj); });
    };
    return CustomSettings;
}());
var CustomFont = /** @class */ (function () {
    function CustomFont(fontName, localName, url) {
        this.fontName = fontName;
        this.localName = localName;
        this.url = url;
    }
    /**
     * Trick to make sure that a font is installed on the client's machine.
     * I found this somewhere online and they claimed it works 99% of the time,
     * it's worked perfectly for me so far
     */
    CustomFont.isFontInstalled = function (font) {
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
            var width = container.clientWidth;
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
    };
    CustomFont.isFontUrlValid = function (fontUrl) {
        return fetch(fontUrl).then(function (response) { return response.ok; });
    };
    CustomFont.prototype.isFontInstalled = function () {
        return CustomFont.isFontInstalled(this.fontName);
    };
    CustomFont.prototype.isUrlValid = function () {
        if (!this.url)
            return Promise.resolve(false);
        if (this.url)
            return CustomFont.isFontUrlValid(this.url);
    };
    return CustomFont;
}());
/**
 * An abstraction and simplification of the storage.sync API to make it use Promises
 */
var sync = {
    get: function (keys) {
        if (keys === void 0) { keys = null; }
        return new Promise(function (resolve) {
            chrome.storage.sync.get(keys, function (storage) { return resolve(storage); });
        });
    },
    set: function (wudoohStorage) {
        return new Promise(function (resolve) { return chrome.storage.sync.set(wudoohStorage, function () { return resolve(); }); });
    }
};
/**
 * An abstraction and simplification of the tabs API to make it use Promises
 */
var tabs = {
    create: function (url) {
        return new Promise(function (resolve) {
            return chrome.tabs.create({ url: url }, function (tab) { return resolve(tab); });
        });
    },
    queryAllTabs: function () {
        return new Promise(function (resolve) {
            return chrome.tabs.query({}, function (tabs) { return resolve(tabs); });
        });
    },
    queryCurrentTab: function () {
        return new Promise(function (resolve) {
            return chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { return resolve(tabs); });
        });
    },
    sendMessage: function (tabId, message) {
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
    var _this = this;
    var localTask = wait(millis, function () {
        if (localTask === _this.currentTask)
            func.call(_this);
    });
    this.currentTask = localTask;
};
// endregion Extensions
