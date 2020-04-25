/**
 * This is the code that runs on the background page of the extension.
 *
 * Here we only run code that will execute when the extension is installed or updated.
 */

///<reference path="./shared.ts"/>

import InstalledDetails = chrome.runtime.InstalledDetails;

function launchSite(path: string = "") {
    tabs.create(homePage + path);
}

/**
 * Runs on install or update to check if the storage has initialized all its values correctly.
 * If some key has not been initialized then it will create it and set it to its default value
 */
runtime.onInstalled.addListener((details: InstalledDetails) => {
    let storage: WudoohStorage;
    sync.get(keys).then((storage: WudoohStorage) => {
        // User has just installed extension
        if (details.reason == "install") {

        }
        // User has updated extension
        if (details.reason == "update") {
            let oldVersion: string = details.previousVersion; // string of previous version if we need it
            let newVersion: string = runtime.getManifest().version; // string of newly updated version
        }
        let promises: Array<Promise<void>> = [];
        if (storage.textSize == null) promises.push(sync.set({textSize: defaultTextSize}));
        if (storage.lineHeight == null) promises.push(sync.set({lineHeight: defaultLineHeight}));
        if (storage.onOff == null) promises.push(sync.set({onOff: true}));
        if (storage.font == null) promises.push(sync.set({font: defaultFont}));
        if (storage.whitelisted == null) promises.push(sync.set({whitelisted: []}));
        if (storage.customSettings == null) promises.push(sync.set({customSettings: []}));
        if (storage.customFonts == null) promises.push(sync.set({customFonts: []}));
        return Promise.all(promises);
    }).then(() => sync.get(keys))
        .then(it => storage = it)
        .then(() => tabs.queryAllTabs())
        .then((allTabs: Array<Tab>) => allTabs.forEach((tab: Tab) => {
            if (storage.onOff) {
                let message = {reason: reasonUpdateAllText};
                tabs.sendMessage(tab.id, message);
            }
        }));
});
