const mainDiv = get("main");
const fontsStyle = get("wudoohCustomFontsStyle");
const sizeSlider = get("size");
const heightSlider = get("height");
const onOffSwitch = get("onOffSwitch");
const fontSelect = get("font-select");
const overrideSiteSwitch = get("overrideSettingsSwitch");
const whiteListSwitch = get("whitelistSwitch");
const sizeValue = get("sizeValue");
const heightValue = get("heightValue");
const overrideSettingsValue = get("overrideSettingsLabel");
const whitelistedValue = get("whitelistedLabel");
const websiteText = get("website");
const websiteIcon = get("websiteIcon");
const exportButton = get("exportButton");
const exportAnchor = get("exportAnchor");
const importButton = get("importButton");
const importInput = get("importInput");
async function addCustomFonts(customFonts) {
    fontsStyle.textContent = "";
    customFonts.forEach((customFont) => {
        const fontName = customFont.fontName;
        const fontUrl = customFont.url;
        let injectedCss = `@font-face { font-family: '${fontName}'; src: local('${fontName}')`;
        if (fontUrl)
            injectedCss = injectedCss.concat(`, url('${fontUrl}')`);
        injectedCss = injectedCss.concat(`; }\n`);
        fontsStyle.textContent = fontsStyle.textContent.concat(injectedCss);
        const option = document.createElement("option");
        option.style.fontFamily = fontName;
        option.value = fontName;
        option.textContent = fontName;
        fontSelect.add(option);
    });
}
async function initializeUI() {
    const storage = await sync.get(keys);
    const currentTabs = await tabs.queryCurrentTab();
    addCustomFonts(storage.customFonts);
    onOffSwitch.checked = storage.onOff;
    if (storage.onOff)
        mainDiv.style.maxHeight = "100%";
    else
        mainDiv.style.maxHeight = "0";
    const thisTab = currentTabs[0];
    const thisURL = new URL(thisTab.url).hostname;
    const customSettings = storage.customSettings;
    const whiteListed = storage.whitelisted;
    const custom = customSettings.find((custom) => custom.url === thisURL);
    const isCustom = !!custom;
    let textSize;
    let lineHeight;
    let font;
    if (isCustom) {
        textSize = custom.textSize;
        lineHeight = custom.lineHeight;
        font = custom.font;
    }
    else {
        textSize = storage.textSize;
        lineHeight = storage.lineHeight;
        font = storage.font;
    }
    sizeSlider.value = textSize.toString();
    sizeValue.innerHTML = textSize.toString() + '%';
    heightSlider.value = lineHeight.toString();
    heightValue.innerHTML = lineHeight.toString() + '%';
    fontSelect.value = font;
    fontSelect.style.fontFamily = font;
    websiteText.innerText = thisURL;
    websiteText.title = thisURL;
    if (!thisTab.favIconUrl)
        websiteIcon.style.display = "none";
    else
        websiteIcon.src = thisTab.favIconUrl;
    websiteIcon.title = thisURL;
    websiteIcon.alt = thisURL;
    const isWhitelisted = !!(whiteListed.find((it) => it === thisURL));
    whiteListSwitch.checked = !isWhitelisted;
    if (isWhitelisted)
        whitelistedValue.innerText = "This site is whitelisted";
    else
        whitelistedValue.innerText = "Running on this site";
    overrideSiteSwitch.checked = isCustom;
    if (isCustom)
        overrideSettingsValue.innerText = "Using site specific settings";
    else
        overrideSettingsValue.innerText = "Using global settings";
}
async function updateAllTabsText() {
    const allTabs = await tabs.queryAllTabs();
    allTabs.forEach((tab) => tabs.sendMessage(tab.id, { reason: reasonUpdateAllText }));
}
async function toggleOnOff() {
    await sync.set({ onOff: onOffSwitch.checked });
    if (onOffSwitch.checked) {
        mainDiv.style.maxHeight = "100%";
        updateAllTabsText();
    }
    else {
        mainDiv.style.maxHeight = "0";
        const allTabs = await tabs.queryAllTabs();
        allTabs.forEach((tab) => tabs.sendMessage(tab.id, { reason: reasonToggleOff }));
    }
}
async function updateTextSize() {
    const newSize = parseInt(sizeSlider.value);
    const currentTabs = await tabs.queryCurrentTab();
    const wudoohStorage = await sync.get([keyCustomSettings]);
    const thisURL = new URL(currentTabs[0].url).hostname;
    const customSettings = wudoohStorage.customSettings;
    const custom = customSettings.find((custom) => custom.url === thisURL);
    if (!!custom) {
        custom.textSize = newSize;
        customSettings[customSettings.indexOf(custom)] = custom;
        await sync.set({ customSettings: customSettings });
    }
    else {
        await sync.set({ textSize: newSize });
    }
    updateAllTabsText();
}
async function updateLineHeight() {
    const newHeight = parseInt(heightSlider.value);
    const currentTabs = await tabs.queryCurrentTab();
    const wudoohStorage = await sync.get([keyCustomSettings]);
    const thisURL = new URL(currentTabs[0].url).hostname;
    const customSettings = wudoohStorage.customSettings;
    const custom = customSettings.find((custom) => custom.url === thisURL);
    if (!!custom) {
        custom.lineHeight = newHeight;
        customSettings[customSettings.indexOf(custom)] = custom;
        await sync.set({ customSettings: customSettings });
    }
    else {
        await sync.set({ lineHeight: newHeight });
    }
    updateAllTabsText();
}
async function changeFont() {
    const newFont = fontSelect.value;
    const currentTabs = await tabs.queryCurrentTab();
    const wudoohStorage = await sync.get([keyCustomSettings]);
    const thisURL = new URL(currentTabs[0].url).hostname;
    const customSettings = wudoohStorage.customSettings;
    const custom = customSettings.find((custom) => custom.url === thisURL);
    fontSelect.style.fontFamily = newFont;
    if (!!custom) {
        custom.font = newFont;
        customSettings[customSettings.indexOf(custom)] = custom;
        await sync.set({ customSettings: customSettings });
    }
    else {
        await sync.set({ font: newFont });
    }
    updateAllTabsText();
}
async function toggleOverrideSiteSettings() {
    const currentTabs = await tabs.queryCurrentTab();
    const thisURL = new URL(currentTabs[0].url).hostname;
    let wudoohStorage = await sync.get([keyCustomSettings]);
    let customSettings = wudoohStorage.customSettings;
    if (overrideSiteSwitch.checked) {
        customSettings.push(new CustomSettings(thisURL, parseInt(sizeSlider.value), parseInt(heightSlider.value), fontSelect.value));
        overrideSettingsValue.textContent = "Using site specific settings";
    }
    else {
        customSettings = customSettings.filter((it) => it.url !== thisURL);
        overrideSettingsValue.textContent = "Using global settings";
    }
    await sync.set({ customSettings: customSettings });
    wudoohStorage = await sync.get([keyTextSize, keyLineHeight, keyFont, keyCustomSettings]);
    customSettings = wudoohStorage.customSettings;
    let textSize;
    let lineHeight;
    let font;
    let custom = customSettings.find((custom) => custom.url === thisURL);
    if (!!custom) {
        textSize = custom.textSize;
        lineHeight = custom.lineHeight;
        font = custom.font;
    }
    else {
        textSize = wudoohStorage.textSize;
        lineHeight = wudoohStorage.lineHeight;
        font = wudoohStorage.font;
    }
    sizeSlider.value = textSize.toString();
    sizeValue.innerHTML = textSize.toString() + '%';
    heightSlider.value = lineHeight.toString();
    heightValue.innerHTML = lineHeight.toString() + '%';
    fontSelect.value = font;
    fontSelect.style.fontFamily = font;
    updateAllTabsText();
}
async function toggleWhitelist() {
    const currentTabs = await tabs.queryCurrentTab();
    const thisURL = new URL(currentTabs[0].url).hostname;
    const wudoohStorage = await sync.get([keyWhitelisted]);
    let whitelisted = wudoohStorage.whitelisted;
    if (whiteListSwitch.checked) {
        whitelisted = whitelisted.filter((it) => it != thisURL);
        whitelistedValue.textContent = "Running on this site";
    }
    else {
        whitelisted.push(thisURL);
        whitelistedValue.textContent = "This site is whitelisted";
    }
    await sync.set({ whitelisted: whitelisted });
    updateAllTabsText();
}
async function exportSettings() {
    const wudoohStorage = await sync.get(keys);
    const json = JSON.stringify(wudoohStorage, null, 4);
    exportAnchor.href = "data:application/octet-stream," + encodeURIComponent(json);
    exportAnchor.download = "wudooh.settings.json";
    exportAnchor.click();
}
async function importSettings() {
    const file = importInput.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
        const json = event.target.result;
        let result;
        try {
            result = JSON.parse(json);
        }
        catch (e) {
            if (e instanceof SyntaxError) {
                alert("Import Failed!\n\n" + "Malformed JSON" +
                    "\n\nEnsure settings file contains valid JSON");
                return;
            }
        }
        const errorMessages = [];
        const textSize = result[keyTextSize];
        const lineHeight = result[keyLineHeight];
        const onOff = result[keyOnOff];
        const font = result[keyFont];
        const whitelisted = result[keyWhitelisted];
        const customSettings = result[keyCustomSettings];
        const customFonts = result[keyCustomFonts];
        if (textSize === null) {
            errorMessages.push("Field \"textSize\" is missing! It must be a number between 100 and 300");
        }
        else if (typeof textSize !== "number" || (textSize < 100 || textSize > 300)) {
            errorMessages.push("Field \"textSize\" must be a number between 100 and 300");
        }
        if (lineHeight === null) {
            errorMessages.push("Field \"lineHeight\" is missing! It must be a number between 100 and 300");
        }
        else if (typeof lineHeight !== "number" || (lineHeight < 100 || lineHeight > 300)) {
            errorMessages.push("Field \"lineHeight\" must be a number between 100 and 300");
        }
        if (onOff === null) {
            errorMessages.push("Field \"onOff\" is missing! It must be a boolean");
        }
        else if (typeof onOff !== "boolean") {
            errorMessages.push("Field \"onOff\" must be a boolean");
        }
        if (font === null) {
            errorMessages.push("Field \"font\" is missing! It must be a string");
        }
        else if (typeof font !== "string") {
            errorMessages.push("Field \"font\" must be a string");
        }
        if (whitelisted === null) {
            errorMessages.push("Field \"whitelisted\" is missing! It must be an array of strings");
        }
        else if (!Array.isArray(whitelisted) || (whitelisted.length > 0 && typeof whitelisted[0] !== "string")) {
            errorMessages.push("Field \"whitelisted\" must be an array of strings");
        }
        if (customSettings === null) {
            errorMessages.push("Field \"customSettings\" is missing! It must be an array of CustomSettings objects");
        }
        else if (!Array.isArray(customSettings) || !CustomSettings.isCustomSettingsArray(customSettings)) {
            errorMessages.push("Field \"customSettings\" must be an array of CustomSettings objects");
        }
        if (customFonts === null) {
            errorMessages.push("Field \"customFonts\" is missing! It must be an array of CustomFont objects");
        }
        else if (!Array.isArray(customFonts) || !CustomFont.isCustomFontsArray(customFonts)) {
            errorMessages.push("Field \"customFonts\" must be an array of CustomFont objects");
        }
        if (errorMessages.length > 0) {
            alert("Import Failed!\n\n" + errorMessages.join("\n") +
                "\n\nClick Help to find the guides at the extension website");
            return;
        }
        await sync.set({
            textSize: textSize,
            lineHeight: lineHeight,
            onOff: onOff,
            font: font,
            whitelisted: whitelisted,
            customSettings: customSettings,
            customFonts: customFonts
        });
        alert("Imported settings successfully!");
        initializeUI();
    };
    reader.readAsText(file);
    importInput.value = null;
}
function popupAddListeners() {
    document.addEventListener("DOMContentLoaded", initializeUI);
    onOffSwitch.onclick = () => toggleOnOff();
    fontSelect.oninput = () => changeFont();
    sizeSlider.oninput = () => {
        sizeValue.textContent = sizeSlider.value + '%';
        sizeSlider.postDelayed(250, updateTextSize);
    };
    heightSlider.oninput = () => {
        heightValue.textContent = heightSlider.value + '%';
        heightSlider.postDelayed(250, updateLineHeight);
    };
    whiteListSwitch.onclick = () => toggleWhitelist();
    overrideSiteSwitch.onclick = () => toggleOverrideSiteSettings();
    exportButton.onclick = () => exportSettings();
    importInput.oninput = () => importSettings();
    importButton.onclick = () => importInput.click();
}
popupAddListeners();
