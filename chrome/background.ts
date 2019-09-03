///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>

import sync = chrome.storage.sync;
import onInstalled = chrome.runtime.onInstalled;
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
onInstalled.addListener((details: InstalledDetails) => {
    sync.get(keys, (fromStorage) => {
        if (!fromStorage.textSize) sync.set({textSize: '115',});
        if (!fromStorage.lineHeight) sync.set({lineHeight: '125',});
        if (!fromStorage.onOff) sync.set({onOff: true,});
        if (!fromStorage.font) sync.set({font: "Droid Arabic Naskh"});
        if (!fromStorage.whitelisted) sync.set({whitelisted: []});
        if (!fromStorage.customSettings) sync.set({customSettings: []});

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