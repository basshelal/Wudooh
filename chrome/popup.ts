/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are 6 options, textSize, lineHeight, onOff, font, whitelisted and customSettings
 */

///<reference path="../../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>

const mainDiv = get<HTMLDivElement>("main");

// Custom Fonts
const fontsStyle: HTMLStyleElement = get("wudoohCustomFontsStyle");

// Inputs
const sizeSlider = get<HTMLInputElement>("size");
const heightSlider = get<HTMLInputElement>("height");
const onOffSwitch = get<HTMLInputElement>("onOffSwitch");
const fontSelect = get<HTMLSelectElement>("font-select");
const overrideSiteSwitch = get<HTMLInputElement>("overrideSettingsSwitch");
const whiteListSwitch = get<HTMLInputElement>("whitelistSwitch");

// Labels
const sizeValue = get<HTMLLabelElement>("sizeValue");
const heightValue = get<HTMLLabelElement>("heightValue");
const overrideSettingsValue = get<HTMLLabelElement>("overrideSettingsLabel");
const whitelistedValue = get<HTMLLabelElement>("whitelistedLabel");

// Website Info
const websiteText = get<HTMLHeadingElement>("website");
const websiteIcon = get<HTMLImageElement>("websiteIcon");

// Import / Export
let exportButton = get<HTMLButtonElement>("exportButton");
let exportAnchor = get<HTMLAnchorElement>("exportAnchor");
let importButton = get<HTMLButtonElement>("importButton");
let importInput = get<HTMLInputElement>("importInput");

function addCustomFonts(customFonts: Array<CustomFont>): Promise<void> {
    return new Promise(() => {
        customFonts.forEach((customFont: CustomFont) => {
            const fontName: string = customFont.fontName;
            const fontUrl: string = customFont.url;

            let injectedCss = `@font-face { font-family: '${fontName}'; src: local('${fontName}')`;
            if (fontUrl) injectedCss = injectedCss.concat(`, url('${fontUrl}')`);
            injectedCss = injectedCss.concat(`; }\n`);

            fontsStyle.innerHTML = fontsStyle.innerHTML.concat(injectedCss);

            let option: HTMLOptionElement = document.createElement("option");
            option.style.fontFamily = fontName;
            option.value = fontName;
            option.innerHTML = fontName;

            fontSelect.add(option);
        });
    });
}

/**
 * Gets options from the chrome's storage sync for the user with default values if they do not already exist,
 * this is only called when the document (popup.html) is loaded, it only initializes values and updates the UI
 * to match the settings
 */
function initializeUI() {
    let storage: WudoohStorage;
    sync.get(keys).then((_storage: WudoohStorage) => {
        storage = _storage;
        return tabs.queryCurrentTab();
    }).then((tabs: Array<Tab>) => {
        addCustomFonts(storage.customFonts);
        // If the extension is off then hide the main div
        onOffSwitch.checked = storage.onOff;
        if (storage.onOff) mainDiv.style.maxHeight = "100%";
        else mainDiv.style.maxHeight = "0";

        let thisTab: Tab = tabs[0];
        let thisURL: string = new URL(thisTab.url).hostname;

        let customSettings: Array<CustomSettings> = storage.customSettings as Array<CustomSettings>;
        let whiteListed: Array<string> = storage.whitelisted as Array<string>;

        let textSize: number;
        let lineHeight: number;
        let font: string;
        // The above will be different if thisURL is a custom one so we set them depending on this
        let custom = customSettings.find((custom: CustomSettings) => custom.url === thisURL);
        if (!!custom) {
            textSize = custom.textSize;
            lineHeight = custom.lineHeight;
            font = custom.font;
        } else {
            textSize = storage.textSize;
            lineHeight = storage.lineHeight;
            font = storage.font;
        }

        // Initialize all the HTMLElements to the values from storage
        sizeSlider.value = textSize.toString();
        sizeValue.innerHTML = textSize.toString() + '%';
        heightSlider.value = lineHeight.toString();
        heightValue.innerHTML = lineHeight.toString() + '%';
        fontSelect.value = font;
        fontSelect.style.fontFamily = font;
        websiteText.innerText = thisURL;
        if (!thisTab.favIconUrl) websiteIcon.style.display = "none";
        else websiteIcon.src = thisTab.favIconUrl;
        websiteIcon.title = thisURL;
        websiteIcon.alt = thisURL;

        let isWhitelisted: boolean = !!(whiteListed.find((it: string) => it === thisURL));
        let isCustom: boolean = !!custom;

        whiteListSwitch.checked = !isWhitelisted;
        if (isWhitelisted) whitelistedValue.innerText = "This site is whitelisted";
        else whitelistedValue.innerText = "Running on this site";

        overrideSiteSwitch.checked = isCustom;
        if (isCustom) overrideSettingsValue.innerText = "Using site specific settings";
        else overrideSettingsValue.innerText = "Using global settings";
    });
}

/**
 * Updates all Arabic text in all tabs to adhere to the new options. This is done by sending a message to all
 * tabs that main.ts will handle.
 */
function updateAllText() {
    tabs.queryAllTabs().then((allTabs: Array<Tab>) => allTabs.forEach((tab: Tab) => {
        let message = {reason: reasonUpdateAllText};
        tabs.sendMessage(tab.id, message);
    }));
}

/**
 * Toggles the on off switch and saves the "onOff" setting, this will update all text if the switch is turned on
 */
function toggleOnOff() {
    sync.set({onOff: onOffSwitch.checked}).then(() => {
        if (onOffSwitch.checked) {
            mainDiv.style.maxHeight = "100%";
            updateAllText();
        } else {
            mainDiv.style.maxHeight = "0";
            tabs.queryAllTabs().then((allTabs: Array<Tab>) => allTabs.forEach((tab: Tab) => {
                let message = {
                    reason: reasonToggleOnOff,
                    onOff: false
                };
                tabs.sendMessage(tab.id, message);
            }));
        }
    });
}

/**
 * Update font size by updating all text and then saving the setting
 */
function updateSize() {
    sync.set({textSize: parseInt(sizeSlider.value)}).then(() => updateAllText());
}

/**
 * Update line height by updating all text and then saving the setting
 */
function updateHeight() {
    sync.set({lineHeight: parseInt(heightSlider.value)}).then(() => updateAllText());
}

/**
 * Changes the font and saves the "font" setting, this will update all text
 */
function changeFont() {
    fontSelect.style.fontFamily = fontSelect.value;
    sync.set({font: fontSelect.value,}).then(() => updateAllText());
}

/**
 * Toggles the override site settings switch and saves the setting
 */
function toggleOverrideSiteSettings() {
    let thisURL: string;
    // This only requires this current tab
    tabs.queryCurrentTab().then((tabs: Array<Tab>) => {
        // Get the url we are currently on
        thisURL = new URL(tabs[0].url).hostname;

        return sync.get([keyCustomSettings]);
    }).then((storage: WudoohStorage) => {
        // Get the array of all custom websites
        let customSettings: Array<CustomSettings> = storage.customSettings;

        // Override switch is on so use custom settings
        if (overrideSiteSwitch.checked) {
            let custom = new CustomSettings(thisURL, parseInt(sizeSlider.value), parseInt(heightSlider.value), fontSelect.value);
            customSettings.push(custom);
            overrideSettingsValue.innerText = "Using site specific settings";
        } else {
            // Using global settings
            // Remove all occurrences of this url from customSettings, just in case
            customSettings = customSettings.filter((it: CustomSettings) => it.url !== thisURL);
            overrideSettingsValue.innerText = "Using global settings";
        }

        // Set the array of all whitelisted websites in storage
        return sync.set({customSettings: customSettings});
    }).then(() => updateAllText());
}

/**
 * Toggles this site's whitelist status, this is only done to the active tab's site.
 * Note that the switch checked means that the site is running and is not whitelisted,
 * the switched unchecked means the site does not run the script and is whitelisted.
 * The whitelist saved contains the sites that are whitelisted, meaning the ones that do
 * not run the script. The user must reload to see any changes as original formatting
 * is not preserved
 */
function toggleWhitelist() {
    let thisURL: string;
    // This only requires this current tab
    tabs.queryCurrentTab().then((tabs: Array<Tab>) => {
        // Get the url we are on right now
        thisURL = new URL(tabs[0].url).hostname;

        return sync.get([keyWhitelisted]);
    }).then((storage: WudoohStorage) => {
        // Get the array of all whitelisted websites
        let whitelisted: Array<string> = storage.whitelisted;

        // Allowed to run on this site
        if (whiteListSwitch.checked) {
            // Remove all occurrences of this url from that array, just in case
            whitelisted = whitelisted.filter((it: string) => it != thisURL);
            whitelistedValue.innerText = "Running on this site";
        } else {
            // Whitelisted, add this url to the whitelisted array
            whitelisted.push(thisURL);
            whitelistedValue.innerText = "This site is whitelisted";
        }

        // Set the array of all whitelisted websites in storage
        return sync.set({whitelisted: whitelisted});
    }).then(() => updateAllText());
}

/**
 * Exports all settings saved in chrome sync storage to a pretty json file called "settings.wudooh.json"
 */
function exportSettings() {
    sync.get(keys).then((storage: WudoohStorage) => {
        let json: string = JSON.stringify(storage, null, 4);
        exportAnchor.href = "data:application/octet-stream," + encodeURIComponent(json);
        exportAnchor.download = "settings.wudooh.json";
        exportAnchor.click();
    });
}

/**
 * Imports settings from a json file, this function has extensive error checking to ensure that all fields read are
 * valid
 */
function importSettings() {
    var file: File = importInput.files[0];
    var reader: FileReader = new FileReader();
    reader.onload = (event: ProgressEvent) => {
        // @ts-ignore
        let json: string = event.target.result;
        let result: Array<any> = JSON.parse(json);

        let textSize: number = result[keyTextSize];
        let lineHeight: number = result[keyLineHeight];
        let onOff: boolean = result[keyOnOff];
        let font: string = result[keyFont];
        let whitelisted: Array<string> = result[keyWhitelisted];
        let customSettings: Array<CustomSettings> = result[keyCustomSettings];

        let valid: boolean = true;

        if (textSize) {
            if (typeof textSize !== "number" || (textSize < 100 || textSize > 300)) {
                alert("Import failed!\n\nField \"textSize\" must be a number between 100 and 300");
                valid = false;
            }
        } else {
            alert("Import failed!\n\nField \"textSize\" is missing! It must be a number between 100 and 300");
            valid = false;
        }

        if (lineHeight) {
            if (typeof lineHeight !== "number" || (lineHeight < 100 || lineHeight > 300)) {
                alert("Import failed!\n\nField \"lineHeight\" must be a number between 100 and 300");
                valid = false;
            }
        } else {
            alert("Import failed!\n\nField \"lineHeight\" is missing! It must be a number between 100 and 300");
            valid = false;
        }

        if (!!onOff) {
            if (typeof onOff !== "boolean") {
                alert("Import failed!\n\nField \"onOff\" must be a boolean");
                valid = false;
            }
        } else {
            alert("Import failed!\n\nField \"onOff\" is missing! It must be a boolean");
            valid = false;
        }

        if (font) {
            if (typeof font !== "string") {
                alert("Import failed!\n\nField \"font\" must be a string");
                valid = false;
            }
        } else {
            alert("Import failed!\n\nField \"font\" is missing! It must be a string");
            valid = false;
        }

        if (whitelisted) {
            if (!(whitelisted instanceof Array) || (whitelisted.length > 0 && typeof whitelisted[0] !== "string")) {
                alert("Import failed!\n\nField \"whitelisted\" must be an array of strings");
                valid = false;
            }
        } else {
            alert("Import failed!\n\nField \"whitelisted\" is missing! It must be an array of strings");
            valid = false;
        }

        if (customSettings) {
            if (!(customSettings instanceof Array) || !CustomSettings.isCustomSettingsArray(customSettings)) {
                alert("Import failed!\n\nField \"customSettings\" must be an array of CustomSettings objects");
                valid = false;
            }
        } else {
            alert("Import failed!\n\nField \"customSettings\" is missing! It must be an array of CustomSettings objects");
            valid = false;
        }

        if (!valid) {
            window.close();
            return;
        }

        // If we've reached here the JSON was valid, save all new settings!
        sync.set({
            textSize: textSize,
            lineHeight: lineHeight,
            onOff: onOff,
            font: font,
            whitelisted: whitelisted,
            customSettings: customSettings
        });
        alert("Imported settings successfully!");
        // we must close the window otherwise it doesn't work again for some reason!
        close();
        window.close();
    };
    reader.readAsText(file);
}

/**
 * Add all listeners to the UI elements
 */
function popupAddListeners() {
    // Get options when the popup.html document is loaded
    document.addEventListener("DOMContentLoaded", initializeUI);

    // Update size and height HTML when input is changed, changes no variables so cheap
    sizeSlider.oninput = () => sizeValue.innerHTML = sizeSlider.value + '%';
    heightSlider.oninput = () => heightValue.innerHTML = heightSlider.value + '%';

    // Update text and save options when any change happens, including by using keys, mouse touch etc
    sizeSlider.onchange = () => sizeSlider.postDelayed(250, updateSize);
    heightSlider.onchange = () => heightSlider.postDelayed(250, updateHeight);

    // Update switches when they're clicked
    onOffSwitch.onclick = () => toggleOnOff();
    whiteListSwitch.onclick = () => toggleWhitelist();
    overrideSiteSwitch.onclick = () => toggleOverrideSiteSettings();

    // Update font when a new item is selected
    fontSelect.oninput = () => changeFont();

    // Export settings when button is clicked
    exportButton.onclick = () => exportSettings();

    // The invisible input is the one in charge of dealing with the importing
    importInput.oninput = () => importSettings();

    // Clicking the button simulates clicking the import input which is the one dealing with the actual file reading
    importButton.onclick = () => importInput.click();
}

popupAddListeners();
