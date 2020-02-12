/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are 6 options, textSize, lineHeight, onOff, font, whitelisted and customSettings
 */

///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>

import sync = chrome.storage.sync;
import tabs = chrome.tabs;
import Tab = tabs.Tab;

/**
 * Shorthand for {@linkcode document.getElementById}, automatically casts to T, an HTMLElement
 *
 * @param elementId the id of the element to get
 */
function get<T extends HTMLElement>(elementId: string): T | null {
    return document.getElementById(elementId) as T
}

// Inputs
const size = get<HTMLInputElement>("size");
const height = get<HTMLInputElement>("height");
const onOffSwitch = get<HTMLInputElement>("onOffSwitch");
const fontSelect = get<HTMLSelectElement>("font-select");
const overrideSiteSwitch = get<HTMLInputElement>("overrideSettingsSwitch");
const whiteListSwitch = get<HTMLInputElement>("whitelistSwitch");

// Labels
const sizeValue = get("sizeValue");
const heightValue = get("heightValue");
const overrideSettingsValue = get("overrideSettingsLabel");
const whitelistedValue = get("whitelistedLabel");

// Website Info
const websiteText = get<HTMLHeadingElement>("website");
const websiteIcon = get<HTMLImageElement>("websiteIcon");

// Import / Export
let exportButton = get<HTMLButtonElement>("exportButton");
let exportAnchor = get<HTMLAnchorElement>("exportAnchor");
let importButton = get<HTMLButtonElement>("importButton");
let importInput = get<HTMLInputElement>("importInput");

/**
 * Updates all Arabic text in all tabs to adhere to the new options. This is done by sending a message to all
 * tabs that main.ts will handle.
 * In most cases not closing the popup does not update the text for some reason.
 * Also, the updated text will have problems with spacing, making the actual look of a set of options differ
 * somewhat from the live updated look, a page refresh will always solve this
 */
function updateAllText() {
    // Only update text if this site is checked and is not whitelisted
    if (onOffSwitch.checked && whiteListSwitch.checked) {

        sync.get(["textSize", "lineHeight", "font", "customSettings"], (fromStorage) => {
            // We need the old values to know how much we should change the options in main.ts
            let oldS: number = fromStorage.textSize;
            let oldH: number = fromStorage.lineHeight;
            let font: string = fromStorage.font;
            let customSettings: Array<CustomSettings> = fromStorage.customSettings as Array<CustomSettings>;

            // Send a message to all tabs
            tabs.query({}, (allTabs: Array<Tab>) => {
                allTabs.forEach((tab: Tab) => {
                    let thisURL: string = new URL(tab.url).hostname;
                    let custom = customSettings.findFirst((custom: CustomSettings) => custom.url === thisURL);
                    if (custom) {
                        oldS = custom.textSize;
                        oldH = custom.lineHeight;
                        font = custom.font;
                    }
                    let message = {
                        oldSize: oldS,
                        oldHeight: oldH,
                        newSize: parseInt(size.value),
                        newHeight: parseInt(height.value),
                        font: font
                    };
                    tabs.sendMessage(tab.id, message);
                });
            });
        });
    }

    // Save options at the end, even if the above if statement was false
    sync.set({
        textSize: parseInt(size.value),
        lineHeight: parseInt(height.value),
        onOff: onOffSwitch.checked,
        font: fontSelect.value
    });
}

/**
 * Gets options, this gets them from the chrome's storage sync for the user with default values if they do not
 * already exist, this is only called when the document (popup.html) is loaded, it only initializes values and
 * updates UI
 */
function updateUI() {

    sync.get({
        textSize: defaultTextSize,
        lineHeight: defaultLineHeight,
        onOff: true,
        font: defaultFont,
        whitelisted: [],
        customSettings: []
    }, (fromStorage) => {
        tabs.query({active: true, currentWindow: true}, (tabs: Array<Tab>) => {
            let thisTab: Tab = tabs[0];
            let thisURL: string = new URL(thisTab.url).hostname;

            let customSettings: Array<CustomSettings> = fromStorage.customSettings as Array<CustomSettings>;
            let whiteListed: Array<string> = fromStorage.whitelisted as Array<string>;

            let textSize: number;
            let lineHeight: number;
            let font: string;

            let custom = customSettings.findFirst((custom: CustomSettings) => custom.url === thisURL);
            if (custom) {
                textSize = custom.textSize;
                lineHeight = custom.lineHeight;
                font = custom.font;
            } else {
                textSize = fromStorage.textSize;
                lineHeight = fromStorage.lineHeight;
                font = fromStorage.font;
            }

            size.value = textSize.toString();
            sizeValue.innerHTML = textSize.toString() + '%';
            height.value = lineHeight.toString();
            heightValue.innerHTML = lineHeight.toString() + '%';
            fontSelect.value = font;
            onOffSwitch.checked = fromStorage.onOff;

            let isWhitelisted: boolean = !!(whiteListed.findFirst((it) => it === thisURL));
            let isCustom: boolean = !!custom;

            whiteListSwitch.checked = !isWhitelisted;
            if (isWhitelisted) whitelistedValue.innerText = "This site is whitelisted";
            else whitelistedValue.innerText = "Running on this site";

            overrideSiteSwitch.checked = isCustom;
            if (isCustom) overrideSettingsValue.innerText = "Using site specific settings";
            else overrideSettingsValue.innerText = "Using default settings";

            websiteText.innerText = thisURL;
            websiteIcon.src = "chrome://favicon/size/32/" + thisTab.url;
        });
    });
}

/**
 * Toggles the on off switch, this will update all text if the switch is turned on
 */
function toggleOnOff() {
    sync.set({onOff: onOffSwitch.checked}, () => {
        if (onOffSwitch.checked) {
            updateAllText();
        } else {
        }
    });
}

/**
 * Changes the font, this will update all text and update the Wudooh header
 */
function changeFont() {
    sync.set({font: fontSelect.value,}, () => {
        updateAllText();
    });
}

function toggleOverrideSiteSettings() {
    // This only requires this current tab
    tabs.query({active: true, currentWindow: true}, (tabs: Array<Tab>) => {
        // Get the url we are on right now
        let thisURL = new URL(tabs[0].url).hostname;

        sync.get({"customSettings": []}, (fromStorage) => {
            // Get the array of all custom websites
            let customSettings: Array<CustomSettings> = fromStorage.customSettings as Array<CustomSettings>;

            // Overridden so use custom settings
            if (overrideSiteSwitch.checked) {
                let custom = new CustomSettings(thisURL, parseInt(size.value), parseInt(height.value), fontSelect.value);
                customSettings.push(custom);
                overrideSettingsValue.innerText = "Using site specific settings";
            } else {
                // Using global settings
                // Remove all occurrences of this url from customSettings, just in case
                customSettings = customSettings.filter((it: CustomSettings) => it.url !== thisURL);
                overrideSettingsValue.innerText = "Using global settings";
            }

            // Set the array of all whitelisted websites in storage
            sync.set({customSettings: customSettings});
        });
    });
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

    // This only requires this current tab
    tabs.query({active: true, currentWindow: true}, (tabs: Array<Tab>) => {
        // Get the url we are on right now
        let thisURL = new URL(tabs[0].url).hostname;

        sync.get({"whitelisted": []}, (fromStorage) => {
            // Get the array of all whitelisted websites
            let whitelisted: Array<string> = fromStorage.whitelisted;

            // Allowed to run on this site
            if (whiteListSwitch.checked) {
                // Remove all occurrences of this url from that array, just in case
                whitelisted = whitelisted.filter((it: string) => it != thisURL);
                whitelistedValue.innerText = "Running on this site, reload to see changes";
            } else {
                // Whitelisted, add this url to the whitelisted array
                whitelisted.push(thisURL);
                whitelistedValue.innerText = "This site is whitelisted, reload to see changes";
            }

            // Set the array of all whitelisted websites in storage
            sync.set({whitelisted: whitelisted});
        });
    });
}

function exportSettings() {
    sync.get(keys, (fromStorage) => {
        let json: string = JSON.stringify(fromStorage, null, 4);
        exportAnchor.href = "data:application/octet-stream," + encodeURIComponent(json);
        exportAnchor.download = "settings.wudooh.json";
        exportAnchor.click();
    });
}

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
function addListeners() {
    // Get options when the popup.html document is loaded
    document.addEventListener("DOMContentLoaded", updateUI);

    // Update size and height HTML when input is changed, changes no variables
    size.oninput = () => sizeValue.innerHTML = size.value + '%';
    height.oninput = () => heightValue.innerHTML = height.value + '%';

    // Save options when mouse is released
    size.onmouseup = () => updateAllText();
    height.onmouseup = () => updateAllText();

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

addListeners();