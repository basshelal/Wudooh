/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are three options, textSize, lineHeight and onOff
 */
var size = document.getElementById("size");
var height = document.getElementById("height");
var onOffSwitch = document.getElementById("onOffSwitch");
var fontSelect = document.getElementById("font-select");
var sizeValue = document.getElementById("sizeValue");
var heightValue = document.getElementById("heightValue");
/**
 * Save options, this saves them into chrome's storage sync for the user
 */
function saveOptions() {
    chrome.storage.sync.set({
        textSize: parseInt(size.value),
        lineHeight: parseInt(height.value),
        onOffSwitch: onOffSwitch.checked
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
    if (onOffSwitch.checked) {
        // We need the old values to know how much we should change the options in main.ts
        var oldS_1;
        var oldH_1;
        chrome.storage.sync.get(["textSize", "lineHeight"], function (fromStorage) {
            oldS_1 = fromStorage.textSize;
            oldH_1 = fromStorage.lineHeight;
        });
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(function (tab) {
                var message = {
                    oldSize: oldS_1,
                    oldHeight: oldH_1,
                    newSize: parseInt(size.value),
                    newHeight: parseInt(height.value)
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
        onOffSwitch: true,
    }, function (fromStorage) {
        size.value = fromStorage.textSize;
        sizeValue.innerHTML = fromStorage.textSize + '%';
        height.value = fromStorage.lineHeight;
        heightValue.innerHTML = fromStorage.lineHeight + '%';
        onOffSwitch.checked = fromStorage.onOffSwitch;
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
        onOffSwitch: onOffSwitch.checked,
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
        toggleOnOff();
        if (onOffSwitch.checked)
            updateAllText();
    };
    fontSelect.oninput = function () {
        alert(fontSelect.value);
    };
}
addListeners();
