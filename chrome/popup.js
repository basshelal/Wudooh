/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are 6 options, textSize, lineHeight, onOff, font, whitelisted and customSettings
 */
///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
var sync = chrome.storage.sync;
var tabs = chrome.tabs;
/**
 * Shorthand for {@linkcode document.getElementById}, automatically casts to T, an HTMLElement
 *
 * @param elementId the id of the element to get
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
// Website Info
var websiteText = get("website");
var websiteIcon = get("websiteIcon");
// Import / Export
var exportButton = get("exportButton");
var exportAnchor = get("exportAnchor");
var importButton = get("importButton");
var importInput = get("importInput");
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
        textSize: defaultTextSize,
        lineHeight: defaultLineHeight,
        onOff: true,
        font: defaultFont,
        whitelisted: [],
        customSettings: []
    }, function (fromStorage) {
        tabs.query({active: true, currentWindow: true}, function (tabs) {
            var thisTab = tabs[0];
            var thisURL = new URL(thisTab.url).hostname;
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
            var isWhitelisted = !!(whiteListed.findFirst(function (it) {
                return it === thisURL;
            }));
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
            websiteText.innerText = thisURL;
            websiteIcon.src = "chrome://favicon/size/32/" + thisTab.url;
        });
    });
}
/**
 * Toggles the on off switch, this will update all text if the switch is turned on
 */
function toggleOnOff() {
    sync.set({onOff: onOffSwitch.checked}, function () {
        if (onOffSwitch.checked) {
            updateAllText();
            get("main").style.display = "block";
        } else {
            get("main").style.display = "none";
        }
    });
}
/**
 * Changes the font, this will update all text and update the Wudooh header
 */
function changeFont() {
    sync.set({font: fontSelect.value,}, function () {
        updateAllText();
    });
}
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
                // Using global settings
                // Remove all occurrences of this url from customSettings, just in case
                customSettings = customSettings.filter(function (it) {
                    return it.url !== thisURL;
                });
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
function exportSettings() {
    sync.get(keys, function (fromStorage) {
        var json = JSON.stringify(fromStorage, null, 4);
        exportAnchor.href = "data:application/octet-stream," + encodeURIComponent(json);
        exportAnchor.download = "settings.wudooh.json";
        exportAnchor.click();
    });
}
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
    size.oninput = function () {
        return sizeValue.innerHTML = size.value + '%';
    };
    height.oninput = function () {
        return heightValue.innerHTML = height.value + '%';
    };
    // Save options when mouse is released
    size.onmouseup = function () {
        return updateAllText();
    };
    height.onmouseup = function () {
        return updateAllText();
    };
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
    // Export settings when button is clicked
    exportButton.onclick = function () {
        return exportSettings();
    };
    // The invisible input is the one in charge of dealing with the importing
    importInput.oninput = function () {
        return importSettings();
    };
    // Clicking the button simulates clicking the import input which is the one dealing with the actual file reading
    importButton.onclick = function () {
        return importInput.click();
    };
}
addListeners();
