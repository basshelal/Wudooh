/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are 4 options, textSize, lineHeight, onOff and font
 */
var size = document.getElementById("size");
var height = document.getElementById("height");
var onOffSwitch = document.getElementById("onOffSwitch");
var fontSelect = document.getElementById("font-select");
var whiteListSwitch = document.getElementById("whitelistSwitch");
var sizeValue = document.getElementById("sizeValue");
var heightValue = document.getElementById("heightValue");
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
 * Save options, this saves them into chrome's storage sync for the user
 */
function saveOptions() {
    chrome.storage.sync.set({
        textSize: parseInt(size.value),
        lineHeight: parseInt(height.value),
        onOff: onOffSwitch.checked,
        font: fontSelect.value
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
    if (onOffSwitch.checked && !whiteListSwitch.checked) {
        // We need the old values to know how much we should change the options in main.ts
        var oldS_1;
        var oldH_1;
        var font_1;
        chrome.storage.sync.get(["textSize", "lineHeight", "font"], function (fromStorage) {
            oldS_1 = fromStorage.textSize;
            oldH_1 = fromStorage.lineHeight;
            font_1 = fromStorage.font;
        });
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(function (tab) {
                var message = {
                    oldSize: oldS_1,
                    oldHeight: oldH_1,
                    newSize: parseInt(size.value),
                    newHeight: parseInt(height.value),
                    font: font_1
                };
                chrome.tabs.sendMessage(tab.id, message);
                // close the popup after 400ms so that it's not disturbingly fast
                setTimeout(function () {
                    if (close)
                        window.close();
                }, 400);
            });
        });
    }
    saveOptions();
}
/**
 * Gets options, this gets them from the chrome's storage sync for the user with default values if they do not
 * already exist
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
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            whiteListSwitch.checked = fromStorage.whitelisted
                .contains(new URL(tabs[0].url).hostname);
        });
    });
}
/**
 * Updates the size value from the size range input, this is called when the size range input is changed
 */
function updateSizeHTML() {
    sizeValue.innerHTML = size.value + '%';
}
/**
 * Updates the height value from the height range input, this is called when the height range input is changed
 */
function updateHeightHTML() {
    heightValue.innerHTML = height.value + '%';
}
function toggleOnOff() {
    chrome.storage.sync.set({
        onOff: onOffSwitch.checked
    });
    if (onOffSwitch.checked)
        updateAllText();
}
function changeFont() {
    chrome.storage.sync.set({
        font: fontSelect.value,
    });
    updateAllText();
}

function toggleWhitelist() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        // Get the url I am on right now
        var url = new URL(tabs[0].url).hostname;
        chrome.storage.sync.get({"whitelisted": []}, function (fromStorage) {
            // get the array of all whitelisted websites from the chrome.storage.sync
            var whitelisted = fromStorage.whitelisted;
            if (whiteListSwitch.checked) {
                // add to that array this url
                whitelisted.push(url);
            } else {
                // remove all occurrences of this url from that array, just in case
                whitelisted = whitelisted.filter(function (it) {
                    return it != url;
                });
            }
            // set the array of all whitelisted websites which now includes this one into chrome.storage.sync
            chrome.storage.sync.set({
                whitelisted: whitelisted
            });
            // done, notify refresh or update?
        });
    });
}
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
