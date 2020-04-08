/**
 * This is the code that runs on the background page of the extension.
 *
 * Here we only run code that will execute when the extension is installed or updated.
 */
///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
function launchSite(path) {
    if (path === void 0) { path = ""; }
    tabs.create(new /** @class */ (function () {
        function class_1() {
            this.url = homePage + path;
        }
        return class_1;
    }()));
}
/**
 * Runs on install or update to check if the storage has initialized all its values correctly.
 * If some key has not been initialized then it will create it and set it to its default value
 */
runtime.onInstalled.addListener(function (details) {
    sync.get(keys, function (fromStorage) {
        if (!fromStorage.textSize)
            sync.set({ textSize: defaultTextSize });
        if (!fromStorage.lineHeight)
            sync.set({ lineHeight: defaultLineHeight });
        if (!fromStorage.onOff)
            sync.set({ onOff: true, });
        if (!fromStorage.font)
            sync.set({ font: defaultFont });
        if (!fromStorage.whitelisted)
            sync.set({ whitelisted: [] });
        if (!fromStorage.customSettings)
            sync.set({ customSettings: [] });
        // User has updated extension
        if (details.reason == "update") {
            var oldVersion = details.previousVersion; // string of previous version if we need it
            var newVersion = runtime.getManifest().version; // string of newly updated version
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
