///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/firefox-webext-browser/index.d.ts"/>
/**
 * Runs on install to check if the storage has been initialized or not, and if not will initialize with default values
 */
browser.runtime.onInstalled.addListener((details) => {
    browser.storage.sync.get(["textSize", "lineHeight", "onOff", "font", "whitelisted"]).then((fromStorage) => {
        if (!fromStorage.textSize || !fromStorage.lineHeight || !fromStorage.onOff || !fromStorage.font || !fromStorage.whitelisted) {
            browser.storage.sync.set({
                textSize: '115',
                lineHeight: '125',
                onOff: true,
                font: "Droid Arabic Naskh",
                whitelisted: []
            });
        }
    });
});
//# sourceMappingURL=background.js.map