/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are 6 options, textSize, lineHeight, onOff, font, whitelisted and customSettings
 */
///<reference path="../../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
var mainDiv = get("main");
// Custom Fonts
var fontsStyle = get("wudoohCustomFontsStyle");
// Inputs
var sizeSlider = get("size");
var heightSlider = get("height");
var onOffSwitch = get("onOffSwitch");
var fontSelect = get("font-select");
var overrideSiteSwitch = get("overrideSettingsSwitch");
var whiteListSwitch = get("whitelistSwitch");
// Labels
var sizeValue = get("sizeValue");
var heightValue = get("heightValue");
var overrideSettingsValue = get("overrideSettingsLabel");
var whitelistedValue = get("whitelistedLabel");
// Website Info
var websiteText = get("website");
var websiteIcon = get("websiteIcon");
// Import / Export
var exportButton = get("exportButton");
var exportAnchor = get("exportAnchor");
var importButton = get("importButton");
var importInput = get("importInput");
function addCustomFonts() {
    // Add custom fonts to popup.html
    sync.get([keyCustomFonts]).then(function (storage) {
        var customFonts = storage.customFonts;
        customFonts.forEach(function (customFont) {
            var fontName = customFont.fontName;
            var fontUrl = customFont.url;
            var injectedCss = "@font-face { font-family: '" + fontName + "'; src: local('" + fontName + "')";
            if (fontUrl)
                injectedCss = injectedCss.concat(", url('" + fontUrl + "')");
            injectedCss = injectedCss.concat("; }\n");
            fontsStyle.innerHTML = fontsStyle.innerHTML.concat(injectedCss);
            var option = document.createElement("option");
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
    addCustomFonts();
    // Get all the options with default values if they're not found for some reason
    var storage;
    sync.get(keys).then(function (_storage) {
        storage = _storage;
        return tabs.queryCurrentTab();
    }).then(function (tabs) {
        // If the extension is off then hide the main div
        onOffSwitch.checked = storage.onOff;
        if (storage.onOff)
            mainDiv.style.maxHeight = "100%";
        else
            mainDiv.style.maxHeight = "0";
        var thisTab = tabs[0];
        var thisURL = new URL(thisTab.url).hostname;
        var customSettings = storage.customSettings;
        var whiteListed = storage.whitelisted;
        var textSize;
        var lineHeight;
        var font;
        // The above will be different if thisURL is a custom one so we set them depending on this
        var custom = customSettings.find(function (custom) { return custom.url === thisURL; });
        if (!!custom) {
            textSize = custom.textSize;
            lineHeight = custom.lineHeight;
            font = custom.font;
        }
        else {
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
        websiteIcon.src = "chrome://favicon/size/32/" + thisTab.url;
        websiteIcon.title = thisURL;
        websiteIcon.alt = thisURL;
        var isWhitelisted = !!(whiteListed.find(function (it) { return it === thisURL; }));
        var isCustom = !!custom;
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
        var oldSize_1;
        var oldHeight_1;
        var font_1;
        var customSettings_1;
        sync.get([keyTextSize, keyLineHeight, keyFont, keyCustomSettings]).then(function (storage) {
            // We need the old values to know how much we should change the options in main.ts
            oldSize_1 = storage.textSize;
            oldHeight_1 = storage.lineHeight;
            font_1 = storage.font;
            customSettings_1 = storage.customSettings;
            // Query All Tabs
            return tabs.queryAllTabs();
        }).then(function (allTabs) { return allTabs.forEach(function (tab) {
            var thisURL = new URL(tab.url).hostname;
            var custom = customSettings_1.find(function (custom) { return custom.url === thisURL; });
            if (custom) {
                oldSize_1 = custom.textSize;
                oldHeight_1 = custom.lineHeight;
                font_1 = custom.font;
            }
            var message = {
                reason: reasonUpdateAllText,
                oldSize: oldSize_1,
                oldHeight: oldHeight_1,
                newSize: parseInt(sizeSlider.value),
                newHeight: parseInt(heightSlider.value),
                font: font_1
            };
            tabs.sendMessage(tab.id, message);
        }); });
    }
}
/**
 * Toggles the on off switch and saves the "onOff" setting, this will update all text if the switch is turned on
 */
function toggleOnOff() {
    sync.set({ onOff: onOffSwitch.checked }).then(function () {
        if (onOffSwitch.checked) {
            updateAllText();
            mainDiv.style.maxHeight = "100%";
        }
        else {
            mainDiv.style.maxHeight = "0";
        }
    });
}
/**
 * Update font size by updating all text and then saving the setting
 */
function updateSize() {
    // Update before saving because we need the old value in the update function before saving
    updateAllText();
    sync.set({ textSize: parseInt(sizeSlider.value) });
}
/**
 * Update line height by updating all text and then saving the setting
 */
function updateHeight() {
    // Update before saving because we need the old value in the update function before saving
    updateAllText();
    sync.set({ lineHeight: parseInt(heightSlider.value) });
}
/**
 * Changes the font and saves the "font" setting, this will update all text
 */
function changeFont() {
    fontSelect.style.fontFamily = fontSelect.value;
    sync.set({ font: fontSelect.value, }).then(function () {
        updateAllText();
    });
}
/**
 * Toggles the override site settings switch and saves the setting
 */
function toggleOverrideSiteSettings() {
    var thisURL;
    // This only requires this current tab
    tabs.queryCurrentTab().then(function (tabs) {
        // Get the url we are currently on
        thisURL = new URL(tabs[0].url).hostname;
        return sync.get([keyCustomSettings]);
    }).then(function (storage) {
        // Get the array of all custom websites
        var customSettings = storage.customSettings;
        // Override switch is on so use custom settings
        if (overrideSiteSwitch.checked) {
            var custom = new CustomSettings(thisURL, parseInt(sizeSlider.value), parseInt(heightSlider.value), fontSelect.value);
            customSettings.push(custom);
            overrideSettingsValue.innerText = "Using site specific settings";
        }
        else {
            // Using global settings
            // Remove all occurrences of this url from customSettings, just in case
            customSettings = customSettings.filter(function (it) { return it.url !== thisURL; });
            overrideSettingsValue.innerText = "Using global settings";
        }
        // Set the array of all whitelisted websites in storage
        sync.set({ customSettings: customSettings });
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
    var thisURL;
    // This only requires this current tab
    tabs.queryCurrentTab().then(function (tabs) {
        // Get the url we are on right now
        thisURL = new URL(tabs[0].url).hostname;
        return sync.get([keyWhitelisted]);
    }).then(function (storage) {
        // Get the array of all whitelisted websites
        var whitelisted = storage.whitelisted;
        // Allowed to run on this site
        if (whiteListSwitch.checked) {
            // Remove all occurrences of this url from that array, just in case
            whitelisted = whitelisted.filter(function (it) { return it != thisURL; });
            whitelistedValue.innerText = "Running on this site, reload to see changes";
        }
        else {
            // Whitelisted, add this url to the whitelisted array
            whitelisted.push(thisURL);
            whitelistedValue.innerText = "This site is whitelisted, reload to see changes";
        }
        // Set the array of all whitelisted websites in storage
        sync.set({ whitelisted: whitelisted });
    });
}
/**
 * Exports all settings saved in chrome sync storage to a pretty json file called "settings.wudooh.json"
 */
function exportSettings() {
    sync.get(keys).then(function (storage) {
        var json = JSON.stringify(storage, null, 4);
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
    var file = importInput.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
        // @ts-ignore
        var json = event.target.result;
        var result = JSON.parse(json);
        var textSize = result[keyTextSize];
        var lineHeight = result[keyLineHeight];
        var onOff = result[keyOnOff];
        var font = result[keyFont];
        var whitelisted = result[keyWhitelisted];
        var customSettings = result[keyCustomSettings];
        var valid = true;
        if (textSize) {
            if (typeof textSize !== "number" || (textSize < 100 || textSize > 300)) {
                alert("Import failed!\n\nField \"textSize\" must be a number between 100 and 300");
                valid = false;
            }
        }
        else {
            alert("Import failed!\n\nField \"textSize\" is missing! It must be a number between 100 and 300");
            valid = false;
        }
        if (lineHeight) {
            if (typeof lineHeight !== "number" || (lineHeight < 100 || lineHeight > 300)) {
                alert("Import failed!\n\nField \"lineHeight\" must be a number between 100 and 300");
                valid = false;
            }
        }
        else {
            alert("Import failed!\n\nField \"lineHeight\" is missing! It must be a number between 100 and 300");
            valid = false;
        }
        if (!!onOff) {
            if (typeof onOff !== "boolean") {
                alert("Import failed!\n\nField \"onOff\" must be a boolean");
                valid = false;
            }
        }
        else {
            alert("Import failed!\n\nField \"onOff\" is missing! It must be a boolean");
            valid = false;
        }
        if (font) {
            if (typeof font !== "string") {
                alert("Import failed!\n\nField \"font\" must be a string");
                valid = false;
            }
        }
        else {
            alert("Import failed!\n\nField \"font\" is missing! It must be a string");
            valid = false;
        }
        if (whitelisted) {
            if (!(whitelisted instanceof Array) || (whitelisted.length > 0 && typeof whitelisted[0] !== "string")) {
                alert("Import failed!\n\nField \"whitelisted\" must be an array of strings");
                valid = false;
            }
        }
        else {
            alert("Import failed!\n\nField \"whitelisted\" is missing! It must be an array of strings");
            valid = false;
        }
        if (customSettings) {
            if (!(customSettings instanceof Array) || !CustomSettings.isCustomSettingsArray(customSettings)) {
                alert("Import failed!\n\nField \"customSettings\" must be an array of CustomSettings objects");
                valid = false;
            }
        }
        else {
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
    sizeSlider.oninput = function () { return sizeValue.innerHTML = sizeSlider.value + '%'; };
    heightSlider.oninput = function () { return heightValue.innerHTML = heightSlider.value + '%'; };
    // Update text and save options when any change happens, including by using keys, mouse touch etc
    sizeSlider.onchange = function () { return sizeSlider.postDelayed(250, updateSize); };
    heightSlider.onchange = function () { return heightSlider.postDelayed(250, updateHeight); };
    // Update switches when they're clicked
    onOffSwitch.onclick = function () { return toggleOnOff(); };
    whiteListSwitch.onclick = function () { return toggleWhitelist(); };
    overrideSiteSwitch.onclick = function () { return toggleOverrideSiteSettings(); };
    // Update font when a new item is selected
    fontSelect.oninput = function () { return changeFont(); };
    // Export settings when button is clicked
    exportButton.onclick = function () { return exportSettings(); };
    // The invisible input is the one in charge of dealing with the importing
    importInput.oninput = function () { return importSettings(); };
    // Clicking the button simulates clicking the import input which is the one dealing with the actual file reading
    importButton.onclick = function () { return importInput.click(); };
}
popupAddListeners();
