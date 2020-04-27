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
const defaultDelay = 250;
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
const browserName = (() => {
    const agent = navigator.userAgent.toLowerCase();
    if (agent.includes("firefox"))
        return "firefox";
    if (agent.includes("edg"))
        return "edge";
    if (agent.includes("opr") || agent.includes("opera"))
        return "opera";
    if (agent.includes("chrome"))
        return "chrome";
    return null;
})();
const isChromium = (() => {
    return browserName === "chrome" || browserName === "edge" || browserName === "opera";
})();
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
    static async isFontUrlValid(url) {
        return fetch(url).then(response => response.ok).catch(() => false);
    }
    static async isFontValid(customFont) {
        let isFontInstalled = true;
        let isFontUrlValid = true;
        if (customFont.localName)
            isFontInstalled = CustomFont.isFontInstalled(customFont.localName);
        if (customFont.url)
            isFontUrlValid = (await CustomFont.isFontUrlValid(customFont.url));
        return isFontInstalled && isFontUrlValid;
    }
    static isValidCustomFont(font) {
        const fontName = font.fontName;
        const localName = font.localName;
        const url = font.url;
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
const runtime = (() => {
    if (isChromium)
        return chrome.runtime;
    else
        return browser.runtime;
})();
const sync = {
    async get(keys = null) {
        return new Promise(resolve => {
            if (isChromium)
                chrome.storage.sync.get(keys, storage => resolve(storage));
            else
                browser.storage.sync.get(keys).then(storage => resolve(storage));
        });
    },
    async set(wudoohStorage) {
        return new Promise(resolve => {
            if (isChromium)
                chrome.storage.sync.set(wudoohStorage, () => resolve());
            else
                browser.storage.sync.set(wudoohStorage).then(() => resolve());
        });
    }
};
const tabs = {
    async create(url) {
        return new Promise(resolve => {
            if (isChromium)
                chrome.tabs.create({ url: url }, tab => resolve(tab));
            else
                browser.tabs.create({ url: url }).then(tab => resolve(tab));
        });
    },
    async queryAllTabs() {
        return new Promise(resolve => {
            if (isChromium)
                chrome.tabs.query({}, tabs => resolve(tabs));
            else
                browser.tabs.query({}).then(tabs => resolve(tabs));
        });
    },
    async queryCurrentTab() {
        return new Promise(resolve => {
            if (isChromium)
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs));
            else
                browser.tabs.query({ active: true, currentWindow: true }).then(tabs => resolve(tabs));
        });
    },
    sendMessage(tabId, message) {
        if (isChromium)
            chrome.tabs.sendMessage(tabId, message);
        else
            browser.tabs.sendMessage(tabId, message);
    }
};
async function injectCustomFonts(customFonts) {
    let customFontsStyle = get("wudoohCustomFontsStyle");
    if (customFontsStyle) {
        customFontsStyle.textContent = "";
        document.head.removeChild(customFontsStyle);
        customFontsStyle = null;
    }
    customFontsStyle = document.createElement("style");
    customFontsStyle.id = "wudoohCustomFontsStyle";
    customFonts.forEach((customFont) => {
        customFontsStyle.textContent = customFontsStyle.textContent.concat(CustomFont.injectCSS(customFont));
    });
    document.head.append(customFontsStyle);
    return customFonts;
}
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
