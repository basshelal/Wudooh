///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>

import InstalledDetails = chrome.runtime.InstalledDetails;

/** The keys of the {@linkcode chrome.storage.sync} */
const keys = [
    /** The font size percent, between 100 and 200 */
    "textSize",
    /** The line height percent, between 100 and 200 */
    "lineHeight",
    /** Determines whether the extension is on or off, true is on */
    "onOff",
    /** The font to update to, this is a string */
    "font",
    /** The array of strings of whitelisted websites, this contains their hostnames in the format example.com */
    "whitelisted",
    /** The array of {@linkcode CustomSettings} that represents the sites with custom settings */
    "customSettings"
];

/**
 * Runs on install or update to check if the storage has initialized all its values correctly.
 * If some key has not been initialized then it will create it and set it to its default value
 */
chrome.runtime.onInstalled.addListener((details: InstalledDetails) => {
    chrome.storage.sync.get(keys, (fromStorage) => {
        if (!fromStorage.textSize) chrome.storage.sync.set({textSize: '115',});
        if (!fromStorage.lineHeight) chrome.storage.sync.set({lineHeight: '125',});
        if (!fromStorage.onOff) chrome.storage.sync.set({onOff: true,});
        if (!fromStorage.font) chrome.storage.sync.set({font: "Droid Arabic Naskh"});
        if (!fromStorage.whitelisted) chrome.storage.sync.set({whitelisted: []});
        if (!fromStorage.customSettings) chrome.storage.sync.set({customSettings: []});

        // User has updated extension
        if (details.reason == "update") {
            let oldVersion: string = details.previousVersion; // string of previous version if we need it
            // TODO here we can create a new Tab with the details of the update probably the extension website
            //  basshelal.github.io/Wudooh and do any DB migrations that we want
        }
        // User has just installed extension
        if (details.reason == "install") {
            // TODO here we can create a new Tab with the details of the extension also probably the extension website
            //  basshelal.github.io/Wudooh
        }
    });
});