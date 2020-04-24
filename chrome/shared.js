const runtime = chrome.runtime;
const keyTextSize = "textSize";
const keyLineHeight = "lineHeight";
const keyOnOff = "onOff";
const keyFont = "font";
const keyWhitelisted = "whitelisted";
const keyCustomSettings = "customSettings";
const keyCustomFonts = "customFonts";
const keys = [
    keyTextSize,
    keyLineHeight,
    keyOnOff,
    keyFont,
    keyWhitelisted,
    keyCustomSettings,
    keyCustomFonts
];
const defaultFont = "Droid Arabic Naskh";
const defaultTextSize = 125;
const defaultLineHeight = 145;
const defaultColor = "#880E4F";
const homePage = "http://basshelal.github.io/Wudooh";
const reasonUpdateAllText = "updateAllText";
const reasonInjectCustomFonts = "injectCustomFonts";
const reasonToggleOff = "toggleOff";
const htmlEditables = ["textarea", "input", "text", "email", "number", "search", "tel", "url", "password"];
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
    static injectCSS(font) {
        const stringArray = [];
        stringArray.push(`@font-face { font-family: '${font.fontName}';`);
        if (font.url || font.localName)
            stringArray.push(`src: `);
        if (font.url && font.localName)
            stringArray.push(`local('${font.localName}'), url('${font.url}');}\n`);
        else if (font.localName && !font.url)
            stringArray.push(`local('${font.localName}');}\n`);
        else if (font.url && !font.localName)
            stringArray.push(`url('${font.url}');}\n`);
        return stringArray.join("");
    }
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
