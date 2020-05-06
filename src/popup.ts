///<reference path="./shared.ts"/>

const mainDiv = get<HTMLDivElement>("main")

// Custom Fonts
const fontsStyle = get<HTMLStyleElement>("wudoohCustomFontsStyle")

// Inputs
const sizeSlider = get<HTMLInputElement>("size")
const heightSlider = get<HTMLInputElement>("height")
const onOffSwitch = get<HTMLInputElement>("onOffSwitch")
const fontSelect = get<HTMLSelectElement>("font-select")
const overrideSiteSwitch = get<HTMLInputElement>("overrideSettingsSwitch")
const whiteListSwitch = get<HTMLInputElement>("whitelistSwitch")

// Labels
const sizeValue = get<HTMLLabelElement>("sizeValue")
const heightValue = get<HTMLLabelElement>("heightValue")
const overrideSettingsValue = get<HTMLLabelElement>("overrideSettingsLabel")
const whitelistedValue = get<HTMLLabelElement>("whitelistedLabel")

// Website Info
const websiteText = get<HTMLHeadingElement>("website")
const websiteIcon = get<HTMLImageElement>("websiteIcon")

// Import / Export
const exportButton = get<HTMLButtonElement>("exportButton")
const exportAnchor = get<HTMLAnchorElement>("exportAnchor")
const importButton = get<HTMLButtonElement>("importButton")
const importInput = get<HTMLInputElement>("importInput")

async function initializeUI() {
    const storage: WudoohStorage = await sync.get(keys)
    const currentTabs: Array<Tab> = await tabs.queryCurrentTab()

    const injectedFonts: Array<CustomFont> = await injectCustomFonts(storage.customFonts)
    injectedFonts.forEach((customFont: CustomFont) => {
        const fontName: string = customFont.fontName
        const option: HTMLOptionElement = document.createElement("option")
        option.style.fontFamily = fontName
        option.value = fontName
        option.textContent = fontName
        fontSelect.add(option)
    })

    // If the extension is off then hide the main div
    onOffSwitch.checked = storage.onOff
    if (storage.onOff) mainDiv.style.maxHeight = "100%"
    else mainDiv.style.maxHeight = "0"

    const thisTab: Tab = currentTabs[0]
    const thisURL: string = new URL(thisTab.url).hostname

    const customSettings: Array<CustomSetting> = storage.customSettings as Array<CustomSetting>
    const whiteListed: Array<string> = storage.whitelisted as Array<string>
    const custom: CustomSetting = customSettings.find((custom: CustomSetting) => custom.url === thisURL)
    const isCustom: boolean = !!custom

    let textSize: number
    let lineHeight: number
    let font: string
    if (isCustom) {
        textSize = custom.textSize
        lineHeight = custom.lineHeight
        font = custom.font
    } else {
        textSize = storage.textSize
        lineHeight = storage.lineHeight
        font = storage.font
    }

    // Initialize all the HTMLElements to the values from storage
    sizeSlider.value = textSize.toString()
    sizeValue.innerHTML = textSize.toString() + '%'
    heightSlider.value = lineHeight.toString()
    heightValue.innerHTML = lineHeight.toString() + '%'
    fontSelect.value = font
    fontSelect.style.fontFamily = font
    websiteText.innerText = thisURL
    websiteText.title = thisURL
    if (!thisTab.favIconUrl) websiteIcon.style.display = "none"
    else websiteIcon.src = thisTab.favIconUrl
    websiteIcon.title = thisURL
    websiteIcon.alt = thisURL

    const isWhitelisted: boolean = !!(whiteListed.find((it: string) => it === thisURL))

    whiteListSwitch.checked = !isWhitelisted
    if (isWhitelisted) whitelistedValue.innerText = "This site is whitelisted"
    else whitelistedValue.innerText = "Running on this site"

    overrideSiteSwitch.checked = isCustom
    if (isCustom) overrideSettingsValue.innerText = "Using site specific settings"
    else overrideSettingsValue.innerText = "Using global settings"
}

async function updateAllTabsText() {
    const allTabs = await tabs.queryAllTabs()
    allTabs.forEach((tab: Tab) =>
        tabs.sendMessage(tab.id, {reason: reasonUpdateAllText}))
}

async function toggleOnOff() {
    await sync.set({onOff: onOffSwitch.checked})
    if (onOffSwitch.checked) {
        mainDiv.style.maxHeight = "100%"
        updateAllTabsText()
    } else {
        mainDiv.style.maxHeight = "0"
        const allTabs: Array<Tab> = await tabs.queryAllTabs()
        allTabs.forEach((tab: Tab) =>
            tabs.sendMessage(tab.id, {reason: reasonToggleOff}))
    }
}

async function updateTextSize() {
    const newSize: number = parseInt(sizeSlider.value)
    const currentTabs = await tabs.queryCurrentTab()
    const wudoohStorage: WudoohStorage = await sync.get([keyCustomSettings])

    const thisURL: string = new URL(currentTabs[0].url).hostname
    const customSettings: Array<CustomSetting> = wudoohStorage.customSettings
    const custom: CustomSetting = customSettings.find((custom: CustomSetting) => custom.url === thisURL)

    if (!!custom) {
        custom.textSize = newSize
        customSettings[customSettings.indexOf(custom)] = custom
        await sync.set({customSettings: customSettings})
    } else {
        await sync.set({textSize: newSize})
    }
    updateAllTabsText()
}

async function updateLineHeight() {
    const newHeight: number = parseInt(heightSlider.value)
    const currentTabs = await tabs.queryCurrentTab()
    const wudoohStorage: WudoohStorage = await sync.get([keyCustomSettings])

    const thisURL: string = new URL(currentTabs[0].url).hostname
    const customSettings: Array<CustomSetting> = wudoohStorage.customSettings
    const custom: CustomSetting = customSettings.find((custom: CustomSetting) => custom.url === thisURL)

    if (!!custom) {
        custom.lineHeight = newHeight
        customSettings[customSettings.indexOf(custom)] = custom
        await sync.set({customSettings: customSettings})
    } else {
        await sync.set({lineHeight: newHeight})
    }
    updateAllTabsText()
}

async function changeFont() {
    const newFont: string = fontSelect.value
    const currentTabs = await tabs.queryCurrentTab()
    const wudoohStorage: WudoohStorage = await sync.get([keyCustomSettings])

    const thisURL: string = new URL(currentTabs[0].url).hostname
    const customSettings: Array<CustomSetting> = wudoohStorage.customSettings
    const custom: CustomSetting = customSettings.find((custom: CustomSetting) => custom.url === thisURL)

    fontSelect.style.fontFamily = newFont
    if (!!custom) {
        custom.font = newFont
        customSettings[customSettings.indexOf(custom)] = custom
        await sync.set({customSettings: customSettings})
    } else {
        await sync.set({font: newFont})
    }
    updateAllTabsText()
}

async function toggleOverrideSiteSettings() {
    const currentTabs = await tabs.queryCurrentTab()
    const thisURL: string = new URL(currentTabs[0].url).hostname
    let wudoohStorage: WudoohStorage = await sync.get([keyCustomSettings])
    let customSettings: Array<CustomSetting> = wudoohStorage.customSettings

    if (overrideSiteSwitch.checked) {
        customSettings.push(new CustomSetting(
            thisURL, parseInt(sizeSlider.value), parseInt(heightSlider.value), fontSelect.value)
        )
        overrideSettingsValue.textContent = "Using site specific settings"
    } else {
        customSettings = customSettings.filter((it: CustomSetting) => it.url !== thisURL)
        overrideSettingsValue.textContent = "Using global settings"
    }

    await sync.set({customSettings: customSettings})
    wudoohStorage = await sync.get([keyTextSize, keyLineHeight, keyFont, keyCustomSettings])
    customSettings = wudoohStorage.customSettings as Array<CustomSetting>

    let textSize: number
    let lineHeight: number
    let font: string
    let custom = customSettings.find((custom: CustomSetting) => custom.url === thisURL)
    if (!!custom) {
        textSize = custom.textSize
        lineHeight = custom.lineHeight
        font = custom.font
    } else {
        textSize = wudoohStorage.textSize
        lineHeight = wudoohStorage.lineHeight
        font = wudoohStorage.font
    }

    sizeSlider.value = textSize.toString()
    sizeValue.innerHTML = textSize.toString() + '%'
    heightSlider.value = lineHeight.toString()
    heightValue.innerHTML = lineHeight.toString() + '%'
    fontSelect.value = font
    fontSelect.style.fontFamily = font
    updateAllTabsText()
}

async function toggleWhitelist() {
    const currentTabs = await tabs.queryCurrentTab()
    const thisURL: string = new URL(currentTabs[0].url).hostname
    const wudoohStorage: WudoohStorage = await sync.get([keyWhitelisted])
    let whitelisted: Array<string> = wudoohStorage.whitelisted

    if (whiteListSwitch.checked) {
        whitelisted = whitelisted.filter((it: string) => it != thisURL)
        whitelistedValue.textContent = "Running on this site"
    } else {
        whitelisted.push(thisURL)
        whitelistedValue.textContent = "This site is whitelisted"
    }

    await sync.set({whitelisted: whitelisted})
    updateAllTabsText()
}

async function exportSettings() {
    const wudoohStorage: WudoohStorage = await sync.get(keys)
    const json: string = JSON.stringify(wudoohStorage, null, 4)
    exportAnchor.href = "data:application/octet-stream," + encodeURIComponent(json)
    exportAnchor.download = "wudooh.settings.json"
    exportAnchor.click()
}

async function importSettings() {
    const file: File = importInput.files[0]
    const reader: FileReader = new FileReader()
    reader.onload = async (event: ProgressEvent) => {
        // @ts-ignore
        const json: string = event.target.result
        let result: Array<any>
        try {
            result = JSON.parse(json)
        } catch (e) {
            if (e instanceof SyntaxError) {
                alert("Import Failed!\n\n" + "Malformed JSON" +
                    "\n\nEnsure settings file contains valid JSON")
                return
            }
        }

        const errorMessages: Array<string> = []

        const textSize: number = result[keyTextSize]
        const lineHeight: number = result[keyLineHeight]
        const onOff: boolean = result[keyOnOff]
        const font: string = result[keyFont]
        const whitelisted: Array<string> = result[keyWhitelisted]
        const customSettings: Array<CustomSetting> = result[keyCustomSettings]
        const customFonts: Array<CustomFont> = result[keyCustomFonts]

        if (textSize === null) {
            errorMessages.push("Field \"textSize\" is missing! It must be a number between 100 and 300")
        } else if (typeof textSize !== "number" || (textSize < 100 || textSize > 300)) {
            errorMessages.push("Field \"textSize\" must be a number between 100 and 300")
        }
        if (lineHeight === null) {
            errorMessages.push("Field \"lineHeight\" is missing! It must be a number between 100 and 300")
        } else if (typeof lineHeight !== "number" || (lineHeight < 100 || lineHeight > 300)) {
            errorMessages.push("Field \"lineHeight\" must be a number between 100 and 300")
        }
        if (onOff === null) {
            errorMessages.push("Field \"onOff\" is missing! It must be a boolean")
        } else if (typeof onOff !== "boolean") {
            errorMessages.push("Field \"onOff\" must be a boolean")
        }
        if (font === null) {
            errorMessages.push("Field \"font\" is missing! It must be a string")
        } else if (typeof font !== "string") {
            errorMessages.push("Field \"font\" must be a string")
        }
        if (whitelisted === null) {
            errorMessages.push("Field \"whitelisted\" is missing! It must be an array of strings")
        } else if (!Array.isArray(whitelisted) || (whitelisted.length > 0 && typeof whitelisted[0] !== "string")) {
            errorMessages.push("Field \"whitelisted\" must be an array of strings")
        }
        if (customSettings === null) {
            errorMessages.push("Field \"customSettings\" is missing! It must be an array of CustomSetting objects")
        } else if (!Array.isArray(customSettings) || !CustomSetting.isCustomSettingsArray(customSettings)) {
            errorMessages.push("Field \"customSettings\" must be an array of CustomSetting objects")
        }
        if (customFonts === null) {
            errorMessages.push("Field \"customFonts\" is missing! It must be an array of CustomFont objects")
        } else if (!Array.isArray(customFonts) || !CustomFont.isCustomFontsArray(customFonts)) {
            errorMessages.push("Field \"customFonts\" must be an array of CustomFont objects")
        }

        if (errorMessages.length > 0) {
            alert("Import Failed!\n\n" + errorMessages.join("\n") +
                "\n\nClick Help to find the guides at the extension website")
            return
        }

        // If we've reached here the JSON was valid, save all new settings!
        await sync.set({
            textSize: textSize,
            lineHeight: lineHeight,
            onOff: onOff,
            font: font,
            whitelisted: whitelisted,
            customSettings: customSettings,
            customFonts: customFonts
        })
        alert("Imported settings successfully!")
        initializeUI()
    }
    reader.readAsText(file)
    importInput.value = null
}

function popupAddListeners() {
    document.addEventListener("DOMContentLoaded", initializeUI)

    onOffSwitch.onclick = () => toggleOnOff()

    fontSelect.oninput = () => changeFont()

    sizeSlider.oninput = () => {
        sizeValue.textContent = sizeSlider.value + '%'
        sizeSlider.postDelayed(defaultDelay, updateTextSize)
    }
    heightSlider.oninput = () => {
        heightValue.textContent = heightSlider.value + '%'
        heightSlider.postDelayed(defaultDelay, updateLineHeight)
    }

    whiteListSwitch.onclick = () => toggleWhitelist()
    overrideSiteSwitch.onclick = () => toggleOverrideSiteSettings()

    // Export settings when button is clicked
    exportButton.onclick = () => exportSettings()

    // The invisible input is the one in charge of dealing with the importing
    importInput.oninput = () => importSettings()

    // Clicking the button simulates clicking the import input which is the one dealing with the actual file reading
    importButton.onclick = () => importInput.click()

}

analytics("/popup.html")
popupAddListeners()
