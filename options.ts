///<reference path="../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are three options, textSize, lineHeight and onOff
 */

const size: HTMLInputElement = document.getElementById("size") as HTMLInputElement;
const height: HTMLInputElement = document.getElementById("height") as HTMLInputElement;
const onOffSwitch: HTMLInputElement = document.getElementById("onOffSwitch") as HTMLInputElement;

const sizeValue: HTMLElement = document.getElementById("sizeValue");
const heightValue: HTMLElement = document.getElementById("heightValue");

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
    }, (fromStorage) => {
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
    size.onmouseup = () => saveOptions();
    height.onmouseup = () => saveOptions();

    // Update size and height when input is changed
    size.oninput = () => updateSize();
    height.oninput = () => updateHeight();

    // Update on off switch when on off switch is clicked
    onOffSwitch.onclick = () => toggleOnOff();
}

addListeners();