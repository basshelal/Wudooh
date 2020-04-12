///<reference path="../../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
var template = get("template");
var fontsDiv = get("fontsDiv");
var fontNameInput = get("fontNameInput");
var localNameInput = get("localNameInput");
var urlInput = get("urlInput");
var addButton = get("addButton");
var infoLabel = get("infoLabel");
var fontTest = get("fontTest");
var templateDiv = template.content.querySelector("div");
// Use this to reduce the number of requests made to chrome storage
var displayedFonts = [];
function injectTemporaryCustomFont(fontName, url, localName) {
    var customFontsStyle = get("wudoohCustomFontsStyle");
    if (!customFontsStyle) {
        customFontsStyle = document.createElement("style");
        customFontsStyle.id = "wudoohCustomFontsStyle";
        document.head.append(customFontsStyle);
    }
    var injectedCss = "@font-face { font-family: '" + fontName + "'; src: local('" + localName + "')";
    if (url)
        injectedCss = injectedCss.concat(", url('" + url + "')");
    injectedCss = injectedCss.concat("; }\n");
    customFontsStyle.innerHTML = injectedCss;
}
function notifyCustomFontsChanged(customFonts) {
    tabs.queryAllTabs().then(function (allTabs) {
        allTabs.forEach(function (tab) {
            var message = {
                reason: reasonInjectCustomFonts,
                customFonts: customFonts
            };
            tabs.sendMessage(tab.id, message);
        });
    });
}
function displayFont(customFont) {
    var fontName = customFont.fontName;
    var localName = customFont.localName;
    var fontUrl = customFont.url;
    var rootDiv = document.importNode(templateDiv, true);
    var inputs = rootDiv.getElementsByTagName("input");
    var fontNameInput = inputs.namedItem("templateFontNameInput");
    var urlInput = inputs.namedItem("templateUrlInput");
    var localNameInput = inputs.namedItem("templateLocalNameInput");
    var deleteButton = rootDiv.children.namedItem("templateDeleteButton");
    fontNameInput.value = fontName;
    urlInput.value = fontUrl;
    localNameInput.value = localName;
    var idSuffix = "-" + customFont.fontName;
    rootDiv.id += idSuffix;
    fontNameInput.id += idSuffix;
    urlInput.id += idSuffix;
    localNameInput.id += idSuffix;
    deleteButton.id += idSuffix;
    fontsDiv.appendChild(rootDiv);
    deleteButton.onclick = function () {
        if (confirm("Are you sure you want to delete " + fontNameInput.value + "\nThis cannot be undone")) {
            var font_1 = fontNameInput.value;
            var customFonts_1;
            sync.get([keyCustomFonts]).then(function (storage) {
                customFonts_1 = storage.customFonts.filter(function (it) { return it.fontName !== font_1; });
                return sync.set({ customFonts: customFonts_1 });
            }).then(function () {
                notifyCustomFontsChanged(customFonts_1);
                displayedFonts = customFonts_1.map(function (it) { return it.fontName; });
                rootDiv.parentNode.removeChild(rootDiv);
            });
        }
    };
}
function pressedEnter(event) {
    if (event.code === "Enter")
        addButton.click();
}
function initializeCustomFonts() {
    sync.get([keyCustomFonts]).then(function (storage) {
        var customFonts = storage.customFonts;
        displayedFonts = [];
        customFonts.forEach(function (it) {
            displayFont(it);
            displayedFonts.push(it.fontName);
        });
    });
}
function inputOnInput() {
    this.postDelayed(250, function () {
        var fontName = CSS.escape(fontNameInput.value);
        var url = CSS.escape(urlInput.value);
        var localName = CSS.escape(localNameInput.value);
        injectTemporaryCustomFont(fontName, url, localName);
        fontTest.style.fontFamily = fontName;
    });
}
function addButtonOnClick() {
    var fontName = fontNameInput.value;
    var url = urlInput.value;
    var localName = localNameInput.value;
    if (fontName == "")
        fontName = null;
    if (url == "")
        url = null;
    if (localName == "")
        localName = null;
    var isValid = true;
    if (!fontName) {
        isValid = false;
        infoLabel.style.display = "block";
        infoLabel.innerText = "Font Name cannot be empty!";
        return;
    }
    if (!url && !localName) {
        isValid = false;
        infoLabel.style.display = "block";
        infoLabel.innerText = "URL and local cannot both be empty!";
        return;
    }
    if (displayedFonts.contains(fontName) || allWudoohFonts.contains(fontName)) {
        isValid = false;
        infoLabel.style.display = "block";
        infoLabel.innerText = "A font with this Font Name already exists!";
        return;
    }
    if (isValid) {
        infoLabel.innerText = "";
        var customFonts_2;
        var customFont_1;
        sync.get([keyCustomFonts]).then(function (storage) {
            customFonts_2 = storage.customFonts;
            customFont_1 = new CustomFont(fontName, localName, url);
            customFonts_2.push(customFont_1);
            return sync.set({ customFonts: customFonts_2 });
        }).then(function () {
            displayFont(customFont_1);
            displayedFonts.push(customFont_1.fontName);
            notifyCustomFontsChanged(customFonts_2);
            infoLabel.style.display = "none";
            fontNameInput.value = "";
            urlInput.value = "";
            localNameInput.value = "";
        });
    }
}
function customFontsAddListeners() {
    document.addEventListener("DOMContentLoaded", initializeCustomFonts);
    fontNameInput.onkeypress = pressedEnter;
    localNameInput.onkeypress = pressedEnter;
    urlInput.onkeypress = pressedEnter;
    fontNameInput.oninput = inputOnInput;
    localNameInput.oninput = inputOnInput;
    urlInput.oninput = inputOnInput;
    addButton.onclick = addButtonOnClick;
}
customFontsAddListeners();
