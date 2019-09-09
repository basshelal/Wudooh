///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
var sync = chrome.storage.sync;
var tabs = chrome.tabs;
/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are 6 options, textSize, lineHeight, onOff, font, whitelisted and customSettings
 */
function get(elementId) {
    return document.getElementById(elementId);
}
// Inputs
var size = get("size");
var height = get("height");
var onOffSwitch = get("onOffSwitch");
var fontSelect = get("font-select");
var overrideSiteSwitch = get("overrideSettingsSwitch");
var whiteListSwitch = get("whitelistSwitch");
// Labels
var sizeValue = get("sizeValue");
var heightValue = get("heightValue");
var overrideSettingsValue = get("overrideSettingsLabel");
var whitelistedValue = get("whitelistedLabel");
/**
 * Finds the first element that matches the given {@param predicate} else returns null
 * You can use this as a way to check if the array contains an element that matches the given {@param predicate}, it
 * will return null if none exists
 * @param predicate the predicate to match
 */
Array.prototype.findFirst = function (predicate) {
    for (var i = 0; i < this.length; i++) {
        if (predicate(this[i], i))
            return this[i];
    }
    return null;
};
/**
 * Represents a site that uses different settings from the default settings
 * The settings themselves may be the same as the default but they will change independently
 */
var CustomSettings = /** @class */ (function () {
    function CustomSettings(url, textSize, lineHeight, font) {
        this.url = url;
        this.textSize = textSize;
        this.lineHeight = lineHeight;
        this.font = font;
    }
    return CustomSettings;
}());
/**
 * Updates the font of the Arabic Wudooh heading and font select to match the font selected by the user
 */
function updateWudoohFont(font) {
    get("wudooh").style.fontFamily = font;
    fontSelect.style.fontFamily = font;
}
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
        sync.get(["textSize", "lineHeight", "font", "customSettings"], function (fromStorage) {
            // We need the old values to know how much we should change the options in main.ts
            var oldS = fromStorage.textSize;
            var oldH = fromStorage.lineHeight;
            var font = fromStorage.font;
            var customSettings = fromStorage.customSettings;
            // Send a message to all tabs
            tabs.query({}, function (allTabs) {
                allTabs.forEach(function (tab) {
                    var thisURL = new URL(tab.url).hostname;
                    var custom = customSettings.findFirst(function (custom) {
                        return custom.url === thisURL;
                    });
                    if (custom) {
                        oldS = custom.textSize;
                        oldH = custom.lineHeight;
                        font = custom.font;
                    }
                    var message = {
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
        textSize: '125',
        lineHeight: '125',
        onOff: true,
        font: "Droid Arabic Naskh",
        whitelisted: [],
        customSettings: []
    }, function (fromStorage) {
        tabs.query({active: true, currentWindow: true}, function (tabs) {
            var thisURL = new URL(tabs[0].url).hostname;
            var customSettings = fromStorage.customSettings;
            var whiteListed = fromStorage.whitelisted;
            var textSize;
            var lineHeight;
            var font;
            var custom = customSettings.findFirst(function (custom) {
                return custom.url === thisURL;
            });
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
            updateWudoohFont(font);
            var isWhitelisted = !!whiteListed.findFirst(function (it) {
                return it === thisURL;
            });
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
                overrideSettingsValue.innerText = "Using default settings";
        });
    });
}
/**
 * Toggles the on off switch, this will update all text if the switch is turned on
 */
function toggleOnOff() {
    sync.set({onOff: onOffSwitch.checked}, function () {
        if (onOffSwitch.checked)
            updateAllText();
    });
}
/**
 * Changes the font, this will update all text and update the Wudooh header
 */
function changeFont() {
    sync.set({font: fontSelect.value,}, function () {
        updateAllText();
        updateWudoohFont(fontSelect.value);
    });
}
// TODO not yet finished
function toggleOverrideSiteSettings() {
    // This only requires this current tab
    tabs.query({active: true, currentWindow: true}, function (tabs) {
        // Get the url we are on right now
        var thisURL = new URL(tabs[0].url).hostname;
        sync.get({"customSettings": []}, function (fromStorage) {
            // Get the array of all custom websites
            var customSettings = fromStorage.customSettings;
            // Overridden so use custom settings
            if (overrideSiteSwitch.checked) {
                var custom = new CustomSettings(thisURL, parseInt(size.value), parseInt(height.value), fontSelect.value);
                customSettings.push(custom);
                overrideSettingsValue.innerText = "Using site specific settings";
            } else {
                // Using default settings
                // Remove all occurrences of this url from customSettings, just in case
                customSettings = customSettings.filter(function (it) {
                    return it.url !== thisURL;
                });
                overrideSettingsValue.innerText = "Using default settings";
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
    tabs.query({active: true, currentWindow: true}, function (tabs) {
        // Get the url we are on right now
        var thisURL = new URL(tabs[0].url).hostname;
        sync.get({"whitelisted": []}, function (fromStorage) {
            // Get the array of all whitelisted websites
            var whitelisted = fromStorage.whitelisted;
            // Allowed to run on this site
            if (whiteListSwitch.checked) {
                // Remove all occurrences of this url from that array, just in case
                whitelisted = whitelisted.filter(function (it) {
                    return it != thisURL;
                });
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
 * Add all listeners to the UI elements
 */
function addListeners() {
    // Get options when the popup.html document is loaded
    document.addEventListener("DOMContentLoaded", updateUI);
    // Update size and height HTML when input is changed, changes no variables
    size.oninput = function () {
        return sizeValue.innerHTML = size.value + '%';
    };
    height.oninput = function () {
        return heightValue.innerHTML = height.value + '%';
    };
    // Save options when mouse is released
    size.onmouseup = function () { return updateAllText(); };
    height.onmouseup = function () { return updateAllText(); };
    // Update switches when they're clicked
    onOffSwitch.onclick = function () {
        return toggleOnOff();
    };
    whiteListSwitch.onclick = function () {
        return toggleWhitelist();
    };
    overrideSiteSwitch.onclick = function () {
        return toggleOverrideSiteSettings();
    };
    // Update font when a new item is selected
    fontSelect.oninput = function () {
        return changeFont();
    };
}
addListeners();
// TODO, for export we need to be able to first get ALL the settings before a download is allowed,
//  but because all calls are asynchronous we have to find a way around this somehow
// Export Settings
var exportButton = get("exportButton");
exportButton.href = "data:application/octet-stream," + encodeURIComponent("Wudooh Settings");
exportButton.download = "settings.wudooh.json";
