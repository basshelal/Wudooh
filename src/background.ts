importScripts("./shared.js")
/**
 * This is the code that runs on the background page of the extension.
 *
 * Here we only run code that will execute when the extension is installed or updated.
 */

/**
 * Runs on install or update to check if the storage has initialized all its values correctly.
 * If some key has not been initialized then it will create it and set it to its default value
 */
const onInstalled = async (details): Promise<void> => {
    let storage: WudoohStorage = await sync.get(WudoohKeys.all())
    const promises: Array<Promise<void>> = []
    if (storage.textSize == null) promises.push(sync.set({textSize: DefaultWudoohStorage.textSize}))
    if (storage.lineHeight == null) promises.push(sync.set({lineHeight: DefaultWudoohStorage.lineHeight}))
    if (storage.onOff == null) promises.push(sync.set({onOff: DefaultWudoohStorage.onOff}))
    if (storage.font == null) promises.push(sync.set({font: DefaultWudoohStorage.font}))
    if (storage.whitelisted == null) promises.push(sync.set({whitelisted: DefaultWudoohStorage.whitelisted}))
    if (storage.customSettings == null) promises.push(sync.set({customSettings: DefaultWudoohStorage.customSettings}))
    if (storage.customFonts == null) promises.push(sync.set({customFonts: DefaultWudoohStorage.customFonts}))
    await Promise.all(promises)
    storage = await sync.get(WudoohKeys.all())
    if (storage.onOff) {
        await (tabs.sendMessageAllTabs({reason: MessageReasons.updateAllText}))
    }
}

if (!runtime.onInstalled.hasListener(onInstalled))
    runtime.onInstalled.addListener(onInstalled)