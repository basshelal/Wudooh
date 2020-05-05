const template = get("template");
const fontsDiv = get("fontsDiv");
const fontNameInput = get("fontNameInput");
const localNameInput = get("localNameInput");
const urlInput = get("urlInput");
const addButton = get("addButton");
const infoLabel = get("infoLabel");
const fontTest = get("fontTest");
const templateDiv = template.content.querySelector("div");
let displayedFonts = [];
const allWudoohFonts = [
    "Aldhabi",
    "Almarai",
    "Amiri",
    "Amiri Quran",
    "Andalus",
    "Arabic Typesetting",
    "Aref Ruqaa",
    "Cairo",
    "Changa",
    "Droid Arabic Naskh",
    "Dubai",
    "El Messiri",
    "Harmattan",
    "Jomhuria",
    "Katibeh",
    "Lalezar",
    "Lateef",
    "Lemonada",
    "Mada",
    "Markazi Text",
    "Mehr Nastaliq",
    "Mirza",
    "Neo Sans Arabic",
    "Noto Kufi Arabic",
    "Noto Naskh Arabic",
    "Noto Nastaliq Urdu",
    "Noto Sans Arabic",
    "Rakkas",
    "Reem Kufi",
    "Rooznameh",
    "Sahl Naskh",
    "Scheherazade",
    "Shakstah",
    "Simplified Arabic",
    "Tajawal",
    "Traditional Arabic",
    "Urdu Typesetting",
    "sans-serif",
    "Times New Roman",
    "Arial",
    "Calibri",
    "Original"
];
async function initializeCustomFontsPage() {
    const storage = await sync.get([keyCustomFonts]);
    displayedFonts = [];
    const customFonts = await injectCustomFonts(storage.customFonts);
    customFonts.forEach((it) => {
        displayFont(it);
        displayedFonts.push(it.fontName);
    });
}
async function injectTemporaryCustomFont(customFont) {
    let tempCustomFontsStyle = get("wudoohTempCustomFontsStyle");
    if (!tempCustomFontsStyle) {
        tempCustomFontsStyle = document.createElement("style");
        tempCustomFontsStyle.id = "wudoohTempCustomFontsStyle";
        document.head.append(tempCustomFontsStyle);
    }
    tempCustomFontsStyle.innerHTML = CustomFont.injectCSS(customFont);
}
async function notifyAllTabsCustomFontsChanged(customFonts) {
    injectCustomFonts(customFonts);
    const allTabs = await tabs.queryAllTabs();
    allTabs.forEach((tab) => {
        let message = {
            reason: reasonInjectCustomFonts,
            customFonts: customFonts
        };
        tabs.sendMessage(tab.id, message);
    });
}
function displayFont(customFont) {
    const fontName = customFont.fontName;
    const localName = customFont.localName;
    const fontUrl = customFont.url;
    const rootDiv = document.importNode(templateDiv, true);
    const fontTitle = rootDiv.children.namedItem("templateFontTitle");
    const inputs = rootDiv.getElementsByTagName("input");
    const fontNameInput = inputs.namedItem("templateFontNameInput");
    const urlInput = inputs.namedItem("templateUrlInput");
    const localNameInput = inputs.namedItem("templateLocalNameInput");
    const deleteButton = rootDiv.children.namedItem("templateDeleteButton");
    const checkIcon = rootDiv.children.namedItem("templateCheckIcon");
    const errorIcon = rootDiv.children.namedItem("templateErrorIcon");
    const infoText = rootDiv.children.namedItem("templateInfoText");
    const allElements = [rootDiv, fontTitle, fontNameInput, urlInput, localNameInput, deleteButton, checkIcon, errorIcon, infoText];
    saveFontName(fontName);
    function saveFontName(name) {
        rootDiv.setAttribute("fontName", name);
    }
    function savedFontName() {
        return rootDiv.getAttribute("fontName");
    }
    checkIcon.style.display = "none";
    errorIcon.style.display = "none";
    fontNameInput.value = fontName;
    urlInput.value = fontUrl;
    localNameInput.value = localName;
    infoText.innerText = "";
    const idSuffix = `-${customFont.fontName}`;
    allElements.forEach(element => element.id += idSuffix);
    fontTitle.style.fontFamily = fontName;
    async function editCustomFont(propertyToChange, newValue) {
        const storage = await sync.get([keyCustomFonts]);
        const customFonts = storage.customFonts;
        const syncFont = customFonts.find(it => it.fontName === savedFontName());
        syncFont[propertyToChange] = newValue;
        customFonts[customFonts.indexOf(syncFont)] = syncFont;
        await sync.set({ customFonts: customFonts });
        saveFontName(syncFont.fontName);
        await notifyAllTabsCustomFontsChanged(customFonts);
        fontTitle.style.fontFamily = syncFont.fontName;
    }
    fontNameInput.oninput = () => fontNameInput.postDelayed(defaultDelay, () => {
        const value = fontNameInput.value;
        if (!value) {
            infoText.style.display = "block";
            infoText.innerText = "Font Name cannot be empty!";
            return;
        }
        if (displayedFonts.contains(value) || allWudoohFonts.contains(value)) {
            infoText.style.display = "block";
            infoText.innerText = "A font with this Font Name already exists!";
            return;
        }
        infoText.innerText = "";
        editCustomFont("fontName", value);
    });
    const urlLocalOnInput = async () => {
        const url = urlInput.value;
        const localName = localNameInput.value;
        if ((!url || url === "") && (!localName || localName === "")) {
            infoText.style.display = "block";
            infoText.innerText = "URL and local cannot both be empty!";
            return;
        }
        infoText.innerText = "";
        await editCustomFont("localName", localName);
        await editCustomFont("url", url);
    };
    urlInput.oninput = urlLocalOnInput;
    localNameInput.oninput = urlLocalOnInput;
    deleteButton.onclick = async () => {
        if (confirm(`Are you sure you want to delete font ${fontNameInput.value}\nThis cannot be undone`)) {
            const font = fontNameInput.value;
            const storage = await sync.get([keyCustomFonts]);
            const customFonts = storage.customFonts.filter((it) => it.fontName !== font);
            await sync.set({ customFonts: customFonts });
            notifyAllTabsCustomFontsChanged(customFonts);
            displayedFonts = customFonts.map(it => it.fontName);
            rootDiv.parentNode.removeChild(rootDiv);
        }
    };
    fontsDiv.appendChild(rootDiv);
}
function inputOnInput() {
    this.postDelayed(defaultDelay, () => {
        const fontName = fontNameInput.value;
        const url = urlInput.value;
        const localName = localNameInput.value;
        injectTemporaryCustomFont(new CustomFont(fontName, localName, url));
        fontTest.style.fontFamily = fontName;
        if (!fontName || fontName === "") {
            infoLabel.style.display = "block";
            infoLabel.innerText = "Font Name cannot be empty!";
            return;
        }
        if ((!url || url === "") && (!localName || localName === "")) {
            infoLabel.style.display = "block";
            infoLabel.innerText = "URL and local cannot both be empty!";
            return;
        }
        if (displayedFonts.contains(fontName) || allWudoohFonts.contains(fontName)) {
            infoLabel.style.display = "block";
            infoLabel.innerText = "A font with this Font Name already exists!";
            return;
        }
        infoLabel.innerText = "";
    });
}
async function addButtonOnClick() {
    let fontName = fontNameInput.value;
    let url = urlInput.value;
    let localName = localNameInput.value;
    if (fontName == "")
        fontName = null;
    if (url == "")
        url = null;
    if (localName == "")
        localName = null;
    if (!fontName) {
        infoLabel.style.display = "block";
        infoLabel.innerText = "Font Name cannot be empty!";
        return;
    }
    if (!url && !localName) {
        infoLabel.style.display = "block";
        infoLabel.innerText = "URL and local cannot both be empty!";
        return;
    }
    if (displayedFonts.contains(fontName) || allWudoohFonts.contains(fontName)) {
        infoLabel.style.display = "block";
        infoLabel.innerText = "A font with this Font Name already exists!";
        return;
    }
    infoLabel.innerText = "";
    const storage = await sync.get([keyCustomFonts]);
    const customFonts = storage.customFonts;
    const customFont = new CustomFont(fontName, localName, url);
    customFonts.push(customFont);
    await sync.set({ customFonts: customFonts });
    displayFont(customFont);
    displayedFonts.push(customFont.fontName);
    notifyAllTabsCustomFontsChanged(customFonts);
    infoLabel.style.display = "none";
    fontNameInput.value = "";
    urlInput.value = "";
    localNameInput.value = "";
}
function customFontsAddListeners() {
    function pressedEnter(event) {
        if (event.code === "Enter")
            addButton.click();
    }
    document.addEventListener("DOMContentLoaded", initializeCustomFontsPage);
    fontNameInput.onkeypress = pressedEnter;
    localNameInput.onkeypress = pressedEnter;
    urlInput.onkeypress = pressedEnter;
    fontNameInput.oninput = inputOnInput;
    localNameInput.oninput = inputOnInput;
    urlInput.oninput = inputOnInput;
    addButton.onclick = addButtonOnClick;
}
analytics();
customFontsAddListeners();
