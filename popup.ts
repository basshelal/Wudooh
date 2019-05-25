///<reference path="../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
import Tab = chrome.tabs.Tab;

/**
 * This script is used by the extension's popup (popup.html) for options
 *
 * Currently there are three options, textSize, lineHeight and onOff
 */

const size: HTMLInputElement = document.getElementById("size") as HTMLInputElement;
const height: HTMLInputElement = document.getElementById("height") as HTMLInputElement;
const onOffSwitch: HTMLInputElement = document.getElementById("onOffSwitch") as HTMLInputElement;
const fontSelect: HTMLSelectElement = document.getElementById("font-select") as HTMLSelectElement;

const sizeValue: HTMLElement = document.getElementById("sizeValue");
const heightValue: HTMLElement = document.getElementById("heightValue");

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
function updateAllText(close: boolean = true) {
    if (onOffSwitch.checked) {
        // We need the old values to know how much we should change the options in main.ts
        let oldS: number;
        let oldH: number;
        let font: string;

        chrome.storage.sync.get(["textSize", "lineHeight", "font"], (fromStorage) => {
            oldS = fromStorage.textSize;
            oldH = fromStorage.lineHeight;
            font = fromStorage.font;
        });

        chrome.tabs.query({}, (tabs: Array<Tab>) => {
            tabs.forEach((tab: Tab) => {
                let message = {
                    oldSize: oldS,
                    oldHeight: oldH,
                    newSize: parseInt(size.value),
                    newHeight: parseInt(height.value),
                    font: font
                };
                chrome.tabs.sendMessage(tab.id, message);
                // close the popup after 400ms so that it's not disturbingly fast
                setTimeout(() => {
                    if (close) window.close()
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
        font: "Droid Arabic Naskh"
    }, (fromStorage) => {
        size.value = fromStorage.textSize;
        sizeValue.innerHTML = fromStorage.textSize + '%';
        height.value = fromStorage.lineHeight;
        heightValue.innerHTML = fromStorage.lineHeight + '%';
        onOffSwitch.checked = fromStorage.onOff;
        fontSelect.value = fromStorage.font;
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
        onOff: onOffSwitch.checked,
    });
    if (onOffSwitch.checked) updateAllText();
}

function changeFont() {
    chrome.storage.sync.set({
        font: fontSelect.value,
    });
    updateAllText();
}

function addListeners() {
    // Get options when the popup.html document is loaded
    document.addEventListener("DOMContentLoaded", getOptions);

    // Update size and height HTML when input is changed, changes no variables
    size.oninput = () => updateSizeHTML();
    height.oninput = () => updateHeightHTML();

    // Save options when mouse is released
    size.onmouseup = () => updateAllText();
    height.onmouseup = () => updateAllText();

    // Update on off switch when on off switch is clicked
    onOffSwitch.onclick = () => toggleOnOff();

    fontSelect.oninput = () => changeFont();
}

addListeners();