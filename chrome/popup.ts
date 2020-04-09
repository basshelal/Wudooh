/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are 6 options, textSize, lineHeight, onOff, font, whitelisted and customSettings
 */

///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>

const main = get<HTMLDivElement>("main");

// Custom Fonts
const fontsStyle: HTMLStyleElement = get("customFontsStyle");

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

function addCustomFonts() {
    // Add custom fonts to popup.html
    sync.get({customFonts: []}, (fromStorage) => {
        let customFonts: Array<CustomFont> = fromStorage.customFonts as Array<CustomFont>;

        customFonts.forEach((customFont: CustomFont) => {
            const fontName: string = customFont.fontName;
            const displayedName: string = customFont.displayedName;
            const fontUrl: string = customFont.url;

            let injectedCss = `@font-face { font-family: '${fontName}'; src: local('${fontName}')`;
            if (fontUrl) injectedCss = injectedCss.concat(`, url('${fontUrl}')`);
            injectedCss = injectedCss.concat(`; }\n`);

            fontsStyle.innerHTML = fontsStyle.innerHTML.concat(injectedCss);

            let option: HTMLOptionElement = document.createElement("option");
            option.style.fontFamily = fontName;
            option.value = fontName;
            option.innerHTML = displayedName;
            option.style.color = "#ff00ff";

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
    addCustomFonts();
    // Get all the options with default values if they're not found for some reason
    sync.get({
        textSize: defaultTextSize,
        lineHeight: defaultLineHeight,
        onOff: true,
        font: defaultFont,
        whitelisted: [],
        customSettings: []
    }, (fromStorage) => {
        tabs.query({active: true, currentWindow: true}, (tabs: Array<Tab>) => {
            // If the extension is off then hide the main div
            onOffSwitch.checked = fromStorage.onOff;
            if (fromStorage.onOff) main.style.maxHeight = "100%";
            else main.style.maxHeight = "0";

            let thisTab: Tab = tabs[0];
            let thisURL: string = new URL(thisTab.url).hostname;

            let customSettings: Array<CustomSettings> = fromStorage.customSettings as Array<CustomSettings>;
            let whiteListed: Array<string> = fromStorage.whitelisted as Array<string>;

            let textSize: number;
            let lineHeight: number;
            let font: string;
            // The above will be different if thisURL is a custom one so we set them depending on this
            let custom = customSettings.findFirst((custom: CustomSettings) => custom.url === thisURL);
            if (!!custom) {
                textSize = custom.textSize;
                lineHeight = custom.lineHeight;
                font = custom.font;
            } else {
                textSize = fromStorage.textSize;
                lineHeight = fromStorage.lineHeight;
                font = fromStorage.font;
            }

            // Initialize all the HTMLElements to the values from storage
            sizeSlider.value = textSize.toString();
            sizeValue.innerHTML = textSize.toString() + '%';
            heightSlider.value = lineHeight.toString();
            heightValue.innerHTML = lineHeight.toString() + '%';
            fontSelect.value = font;
            fontSelect.style.fontFamily = font;
            websiteText.innerText = thisURL;
            websiteIcon.src = "chrome://favicon/size/32/" + thisTab.url;
            websiteIcon.title = thisURL;
            websiteIcon.alt = thisURL;

            let isWhitelisted: boolean = !!(whiteListed.findFirst((it: string) => it === thisURL));
            let isCustom: boolean = !!custom;

            whiteListSwitch.checked = !isWhitelisted;
            if (isWhitelisted) whitelistedValue.innerText = "This site is whitelisted";
            else whitelistedValue.innerText = "Running on this site";

            overrideSiteSwitch.checked = isCustom;
            if (isCustom) overrideSettingsValue.innerText = "Using site specific settings";
            else overrideSettingsValue.innerText = "Using global settings";
        });
    });
}

/**
 * Updates all Arabic text in all tabs to adhere to the new options. This is done by sending a message to all
 * tabs that main.ts will handle.
 * The updated text will sometimes have problems with spacing, making the actual look of a set of options differ
 * somewhat from the live updated look, a page refresh will always solve this.
 */
function updateAllText() {
    // Only update text if this site is checked and is not whitelisted
    if (onOffSwitch.checked && whiteListSwitch.checked) {

        sync.get(["textSize", "lineHeight", "font", "customSettings"], (fromStorage) => {
            // We need the old values to know how much we should change the options in main.ts
            let oldSize: number = fromStorage.textSize;
            let oldHeight: number = fromStorage.lineHeight;
            let font: string = fromStorage.font;
            let customSettings: Array<CustomSettings> = fromStorage.customSettings as Array<CustomSettings>;

            // Send a message to all tabs
            tabs.query({}, (allTabs: Array<Tab>) => {
                allTabs.forEach((tab: Tab) => {
                    let thisURL: string = new URL(tab.url).hostname;
                    let custom = customSettings.findFirst((custom: CustomSettings) => custom.url === thisURL);
                    if (custom) {
                        oldSize = custom.textSize;
                        oldHeight = custom.lineHeight;
                        font = custom.font;
                    }
                    let message = {
                        reason: reasonUpdateAllText,
                        oldSize: oldSize,
                        oldHeight: oldHeight,
                        newSize: parseInt(sizeSlider.value),
                        newHeight: parseInt(heightSlider.value),
                        font: font
                    };
                    tabs.sendMessage(tab.id, message);
                });
            });
        });
    }
}

/**
 * Toggles the on off switch and saves the "onOff" setting, this will update all text if the switch is turned on
 */
function toggleOnOff() {
    sync.set({onOff: onOffSwitch.checked}, () => {
        if (onOffSwitch.checked) {
            updateAllText();
            main.style.maxHeight = "100%";
        } else {
            main.style.maxHeight = "0";
        }
    });
}

/**
 * Update font size by updating all text and then saving the setting
 */
function updateSize() {
    // Update before saving because we need the old value in the update function before saving
    updateAllText();
    sync.set({textSize: parseInt(sizeSlider.value)});
}

/**
 * Update line height by updating all text and then saving the setting
 */
function updateHeight() {
    // Update before saving because we need the old value in the update function before saving
    updateAllText();
    sync.set({lineHeight: parseInt(heightSlider.value)});
}

/**
 * Changes the font and saves the "font" setting, this will update all text
 */
function changeFont() {
    fontSelect.style.fontFamily = fontSelect.value;
    sync.set({font: fontSelect.value,}, () => {
        updateAllText();
    });
}

/**
 * Toggles the override site settings switch and saves the setting
 */
function toggleOverrideSiteSettings() {
    // This only requires this current tab
    tabs.query({active: true, currentWindow: true}, (tabs: Array<Tab>) => {
        // Get the url we are currently on
        let thisURL = new URL(tabs[0].url).hostname;

        sync.get({customSettings: []}, (fromStorage) => {
            // Get the array of all custom websites
            let customSettings: Array<CustomSettings> = fromStorage.customSettings as Array<CustomSettings>;

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

        sync.get({whitelisted: []}, (fromStorage) => {
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

/**
 * Exports all settings saved in chrome sync storage to a pretty json file called "settings.wudooh.json"
 */
function exportSettings() {
    sync.get(keys, (fromStorage) => {
        let json: string = JSON.stringify(fromStorage, null, 4);
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
function addListeners() {
    // Get options when the popup.html document is loaded
    document.addEventListener("DOMContentLoaded", initializeUI);

    // Update size and height HTML when input is changed, changes no variables so cheap
    sizeSlider.oninput = () => sizeValue.innerHTML = sizeSlider.value + '%';
    heightSlider.oninput = () => heightValue.innerHTML = heightSlider.value + '%';

    // Update text and save options when any change happens, including by using keys, mouse touch etc
    sizeSlider.onchange = () => updateSize();
    heightSlider.onchange = () => updateHeight();

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
