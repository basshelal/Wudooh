///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
/**
 * Runs on install to check if the storage has been initialized or not, and if not will initialize with default values
 */
chrome.runtime.onInstalled.addListener(function (details) {
    chrome.storage.sync.get(["textSize", "lineHeight", "onOff", "font", "whitelisted"], function (fromStorage) {
        if (!fromStorage.textSize || !fromStorage.lineHeight || !fromStorage.onOff || !fromStorage.font || !fromStorage.whitelisted) {
            chrome.storage.sync.set({
                textSize: '115',
                lineHeight: '125',
                onOff: true,
                font: "Droid Arabic Naskh",
                whitelisted: []
            });
        }
    });
});
