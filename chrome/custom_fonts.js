///<reference path="../../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
const template = get("template");
const fontsDiv = get("fontsDiv");
const fontNameInput = get("fontNameInput");
const localNameInput = get("localNameInput");
const urlInput = get("urlInput");
const addButton = get("addButton");
const infoLabel = get("infoLabel");
const fontTest = get("fontTest");
const templateDiv = template.content.querySelector("div");
// Use this to reduce the number of requests made to chrome storage
let displayedFonts = [];
function injectTemporaryCustomFont(fontName, url, localName) {
    let customFontsStyle = get("wudoohCustomFontsStyle");
    if (!customFontsStyle) {
        customFontsStyle = document.createElement("style");
        customFontsStyle.id = "wudoohCustomFontsStyle";
        document.head.append(customFontsStyle);
    }
    let injectedCss = `@font-face { font-family: '${fontName}'; src: local('${localName}')`;
    if (url)
        injectedCss = injectedCss.concat(`, url('${url}')`);
    injectedCss = injectedCss.concat(`; }\n`);
    customFontsStyle.innerHTML = injectedCss;
}
function notifyCustomFontsChanged(customFonts) {
    tabs.queryAllTabs().then((allTabs) => {
        allTabs.forEach((tab) => {
            let message = {
                reason: reasonInjectCustomFonts,
                customFonts: customFonts
            };
            tabs.sendMessage(tab.id, message);
        });
    });
}
function displayFont(customFont) {
    const fontName = customFont.fontName;
    const localName = customFont.localName;
    const fontUrl = customFont.url;
    const rootDiv = document.importNode(templateDiv, true);
    const inputs = rootDiv.getElementsByTagName("input");
    const fontNameInput = inputs.namedItem("templateFontNameInput");
    const urlInput = inputs.namedItem("templateUrlInput");
    const localNameInput = inputs.namedItem("templateLocalNameInput");
    const deleteButton = rootDiv.children.namedItem("templateDeleteButton");
    fontNameInput.value = fontName;
    urlInput.value = fontUrl;
    localNameInput.value = localName;
    let idSuffix = `-${customFont.fontName}`;
    rootDiv.id += idSuffix;
    fontNameInput.id += idSuffix;
    urlInput.id += idSuffix;
    localNameInput.id += idSuffix;
    deleteButton.id += idSuffix;
    fontsDiv.appendChild(rootDiv);
    deleteButton.onclick = () => {
        if (confirm(`Are you sure you want to delete ${fontNameInput.value}\nThis cannot be undone`)) {
            let font = fontNameInput.value;
            let customFonts;
            sync.get([keyCustomFonts]).then((storage) => {
                customFonts = storage.customFonts.filter((it) => it.fontName !== font);
                return sync.set({ customFonts: customFonts });
            }).then(() => {
                notifyCustomFontsChanged(customFonts);
                displayedFonts = customFonts.map(it => it.fontName);
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
    sync.get([keyCustomFonts]).then((storage) => {
        let customFonts = storage.customFonts;
        displayedFonts = [];
        customFonts.forEach((it) => {
            displayFont(it);
            displayedFonts.push(it.fontName);
        });
    });
}
function inputOnInput() {
    this.postDelayed(250, () => {
        let fontName = CSS.escape(fontNameInput.value);
        let url = CSS.escape(urlInput.value);
        let localName = CSS.escape(localNameInput.value);
        injectTemporaryCustomFont(fontName, url, localName);
        fontTest.style.fontFamily = fontName;
    });
}
function addButtonOnClick() {
    let fontName = fontNameInput.value;
    let url = urlInput.value;
    let localName = localNameInput.value;
    if (fontName == "")
        fontName = null;
    if (url == "")
        url = null;
    if (localName == "")
        localName = null;
    let isValid = true;
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
        let customFonts;
        let customFont;
        sync.get([keyCustomFonts]).then((storage) => {
            customFonts = storage.customFonts;
            customFont = new CustomFont(fontName, localName, url);
            customFonts.push(customFont);
            return sync.set({ customFonts: customFonts });
        }).then(() => {
            displayFont(customFont);
            displayedFonts.push(customFont.fontName);
            notifyCustomFontsChanged(customFonts);
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
