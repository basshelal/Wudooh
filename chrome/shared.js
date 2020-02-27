/**
 * This file contains common shared code that is used by all three main TypeScript files
 * These are background.ts, main.ts, and popup.ts.
 *
 * This trick is done by loading this script before any others when they are requested and
 * then adding the following line at the top of the file for support from WebStorm IDE.
 * ///<reference path="./shared.ts"/>
 */
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
/** The keys of the {@linkcode chrome.storage.sync} */
var keys = [
    keyTextSize,
    keyLineHeight,
    keyOnOff,
    keyFont,
    keyWhitelisted,
    keyCustomSettings
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
/**
 * Finds the first element that matches the given {@param predicate} else returns null
 * You can use this as a way to check if the array contains an element that matches the given {@param predicate}, it
 * will return null if none exists
 * @param predicate the predicate to match
 */
Array.prototype.findFirst = function (predicate) {
    for (var i = 0; i < this.length; i++) {
        if (predicate(this[i], i))
            return this[i];
    }
    return null;
};
Array.prototype.contains = function (element) {
    return !!this.findFirst(function (it) { return it === element; });
};
// endregion Extensions
var defaultFont = "Droid Arabic Naskh";
var defaultTextSize = 115;
var defaultLineHeight = 125;
var defaultColor = "#880E4F";
var homePage = "http://basshelal.github.io/Wudooh";
/**
 * Shorthand for {@linkcode document.getElementById}, automatically casts to T, a HTMLElement
 *
 * @param elementId the id of the element to get
 */
function get(elementId) {
    return document.getElementById(elementId);
}
