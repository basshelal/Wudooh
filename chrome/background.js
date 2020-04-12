/**
 * This is the code that runs on the background page of the extension.
 *
 * Here we only run code that will execute when the extension is installed or updated.
 */
///<reference path="../../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
function launchSite(path) {
    if (path === void 0) { path = ""; }
    tabs.create(homePage + path);
}
/**
 * Runs on install or update to check if the storage has initialized all its values correctly.
 * If some key has not been initialized then it will create it and set it to its default value
 */
runtime.onInstalled.addListener(function (details) {
    var storage;
    sync.get(keys).then(function (storage) {
        // User has just installed extension
        if (details.reason == "install") {
        }
        // User has updated extension
        if (details.reason == "update") {
            var oldVersion = details.previousVersion; // string of previous version if we need it
            var newVersion = runtime.getManifest().version; // string of newly updated version
        }
        var promises = [];
        if (storage.textSize == null)
            promises.push(sync.set({ textSize: defaultTextSize }));
        if (storage.lineHeight == null)
            promises.push(sync.set({ lineHeight: defaultLineHeight }));
        if (storage.onOff == null)
            promises.push(sync.set({ onOff: true }));
        if (storage.font == null)
            promises.push(sync.set({ font: defaultFont }));
        if (storage.whitelisted == null)
            promises.push(sync.set({ whitelisted: [] }));
        if (storage.customSettings == null)
            promises.push(sync.set({ customSettings: [] }));
        if (storage.customFonts == null)
            promises.push(sync.set({ customFonts: [] }));
        return Promise.all(promises);
    }).then(function () { return sync.get(keys); })
        .then(function (it) { return storage = it; })
        .then(function () { return tabs.queryAllTabs(); })
        .then(function (allTabs) { return allTabs.forEach(function (tab) {
        if (storage.onOff) {
            var message = { reason: reasonUpdateAllText };
            tabs.sendMessage(tab.id, message);
        }
    }); });
});
