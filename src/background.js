function launchSite(path = "") {
    tabs.create(homePage + path);
}
runtime.onInstalled.addListener((details) => {
    let storage;
    sync.get(keys).then((storage) => {
        if (details.reason == "install") {
        }
        if (details.reason == "update") {
            let oldVersion = details.previousVersion;
            let newVersion = runtime.getManifest().version;
        }
        let promises = [];
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
    }).then(() => sync.get(keys))
        .then(it => storage = it)
        .then(() => tabs.queryAllTabs())
        .then((allTabs) => allTabs.forEach((tab) => {
        if (storage.onOff) {
            let message = { reason: reasonUpdateAllText };
            tabs.sendMessage(tab.id, message);
        }
    }));
});
