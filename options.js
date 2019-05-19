///<reference path="../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are three options, textSize, lineHeight and onOff
 */
var size = document.getElementById("size");
var height = document.getElementById("height");
var onOffSwitch = document.getElementById("onOffSwitch");
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
function updateSize() {
    sizeValue.innerHTML = size.value + '%';
}
/**
 * Updates the height value from the height range input, this is called when the height range input is changed
 */
function updateHeight() {
    heightValue.innerHTML = height.value + '%';
}
function toggleOnOff() {
    chrome.storage.sync.set({
        onOffSwitch: onOffSwitch.checked,
    });
}
function addListeners() {
    // Get options when the popup.html document is loaded
    document.addEventListener('DOMContentLoaded', getOptions);
    // Save options when mouse is released
    size.onmouseup = function () { return saveOptions(); };
    height.onmouseup = function () { return saveOptions(); };
    // Update size and height when input is changed
    size.oninput = function () { return updateSize(); };
    height.oninput = function () { return updateHeight(); };
    // Update on off switch when on off switch is clicked
    onOffSwitch.onclick = function () { return toggleOnOff(); };
}
addListeners();
