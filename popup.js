/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are 5 options, textSize, lineHeight, onOff, font and whitelisted
 */
var size = document.getElementById("size");
var height = document.getElementById("height");
var onOffSwitch = document.getElementById("onOffSwitch");
var fontSelect = document.getElementById("font-select");
var whiteListSwitch = document.getElementById("whitelistSwitch");
var sizeValue = document.getElementById("sizeValue");
var heightValue = document.getElementById("heightValue");
var whitelistedValue = document.getElementById("whitelistedLabel");
/**
 * Extension function for a contains function in an array
 * @param element the element to check whether is in this array or not
 * @return true if the element exists in this array, false otherwise
 */
Array.prototype.contains = function (element) {
    var result = false;
    for (var i = 0; i < this.length; i++) {
        if (element === this[i]) {
            result = true;
            break;
        }
    }
    return result;
};
/**
 * Updates the font of the Arabic Wudooh heading to match the font selected by the user
 */
function updateWudoohFont() {
    chrome.storage.sync.get("font", function (fromStorage) {
        document.getElementById("wudooh").style.fontFamily = fromStorage.font;
    });
}
/**
 * Updates all Arabic text in all tabs to adhere to the new options. This is done by sending a message to all
 * tabs that main.ts will handle.
 * The popup is closed by default, in most cases not closing the popup does not update the text for some reason.
 * Also, the updated text will have problems with spacing, making the actual look of a set of options differ
 * somewhat from the live updated look, a page refresh will always solve this
 * @param close whether to close the popup after updating text or not, defaults to true
 */
function updateAllText(close) {
    if (close === void 0) {
        close = true;
    }
    // Only update text if this site is checked and is not whitelisted
    if (onOffSwitch.checked && whiteListSwitch.checked) {
        chrome.storage.sync.get(["textSize", "lineHeight", "font"], function (fromStorage) {
            // We need the old values to know how much we should change the options in main.ts
            var oldS = fromStorage.textSize;
            var oldH = fromStorage.lineHeight;
            var font = fromStorage.font;
            // Send a message to all tabs
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach(function (tab) {
                    var message = {
                        oldSize: oldS,
                        oldHeight: oldH,
                        newSize: parseInt(size.value),
                        newHeight: parseInt(height.value),
                        font: font
                    };
                    chrome.tabs.sendMessage(tab.id, message);
                    // close the popup after 400ms so that it's not disturbingly fast and ugly, only aesthetic
                    setTimeout(function () {
                        if (close)
                            window.close();
                    }, 400);
                });
            });
        });
    }
    // Save options at the end, even if the above if statement was false
    chrome.storage.sync.set({
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
function getOptions() {
    chrome.storage.sync.get({
        textSize: '115',
        lineHeight: '125',
        onOff: true,
        font: "Droid Arabic Naskh",
        whitelisted: []
    }, function (fromStorage) {
        size.value = fromStorage.textSize;
        sizeValue.innerHTML = fromStorage.textSize + '%';
        height.value = fromStorage.lineHeight;
        heightValue.innerHTML = fromStorage.lineHeight + '%';
        onOffSwitch.checked = fromStorage.onOff;
        fontSelect.value = fromStorage.font;
        updateWudoohFont();
        // update HTML to say whether running on this site or whitelisted
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            var running = !fromStorage.whitelisted.contains(new URL(tabs[0].url).hostname);
            whiteListSwitch.checked = running;
            if (running)
                whitelistedValue.innerText = "Running on this site";
            else
                whitelistedValue.innerText = "This site is whitelisted";
        });
    });
}
/**
 * Updates the size value HTML from the size range input, this is called when the size range input is changed
 */
function updateSizeHTML() {
    sizeValue.innerHTML = size.value + '%';
}
/**
 * Updates the height value HTML from the height range input, this is called when the height range input is changed
 */
function updateHeightHTML() {
    heightValue.innerHTML = height.value + '%';
}
/**
 * Toggles the on off switch, this will update all text if the switch is turned on
 */
function toggleOnOff() {
    chrome.storage.sync.set({
        onOff: onOffSwitch.checked
    });
    if (onOffSwitch.checked)
        updateAllText();
}
/**
 * Changes the font, this will update all text and update the Wudooh header
 */
function changeFont() {
    chrome.storage.sync.set({
        font: fontSelect.value,
    }, function () {
        updateAllText();
        updateWudoohFont();
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
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        // Get the url we are on right now
        var url = new URL(tabs[0].url).hostname;
        chrome.storage.sync.get({"whitelisted": []}, function (fromStorage) {
            // Get the array of all whitelisted websites
            var whitelisted = fromStorage.whitelisted;
            // Allowed to run on this site
            if (whiteListSwitch.checked) {
                // Remove all occurrences of this url from that array, just in case
                whitelisted = whitelisted.filter(function (it) {
                    return it != url;
                });
                whitelistedValue.innerText = "Running on this site, reload to see changes";
            } else {
                // Whitelisted, add this url to the whitelisted array
                whitelisted.push(url);
                whitelistedValue.innerText = "This site is whitelisted, reload to see changes";
            }
            // Set the array of all whitelisted websites in storage
            chrome.storage.sync.set({
                whitelisted: whitelisted
            });
        });
    });
}

/**
 * Add all listeners to the UI elements
 */
function addListeners() {
    // Get options when the popup.html document is loaded
    document.addEventListener("DOMContentLoaded", getOptions);
    // Update size and height HTML when input is changed, changes no variables
    size.oninput = function () {
        return updateSizeHTML();
    };
    height.oninput = function () {
        return updateHeightHTML();
    };
    // Save options when mouse is released
    size.onmouseup = function () { return updateAllText(); };
    height.onmouseup = function () { return updateAllText(); };
    // Update on off switch when on off switch is clicked
    onOffSwitch.onclick = function () {
        return toggleOnOff();
    };
    fontSelect.oninput = function () {
        return changeFont();
    };
    whiteListSwitch.onclick = function () {
        return toggleWhitelist();
    };
}
addListeners();
