const mainDiv: HTMLDivElement = get<HTMLDivElement>("main")

// Custom Fonts
const fontsStyle: HTMLStyleElement = get<HTMLStyleElement>("wudoohCustomFontsStyle")

// Inputs
const sizeSlider: HTMLInputElement = get<HTMLInputElement>("size")
const heightSlider: HTMLInputElement = get<HTMLInputElement>("height")
const onOffSwitch: HTMLInputElement = get<HTMLInputElement>("onOffSwitch")
const fontSelect: HTMLSelectElement = get<HTMLSelectElement>("font-select")
const overrideSiteSwitch: HTMLInputElement = get<HTMLInputElement>("overrideSettingsSwitch")
const whiteListSwitch: HTMLInputElement = get<HTMLInputElement>("whitelistSwitch")

// Labels
const sizeValue: HTMLLabelElement = get<HTMLLabelElement>("sizeValue")
const heightValue: HTMLLabelElement = get<HTMLLabelElement>("heightValue")
const overrideSettingsValue: HTMLLabelElement = get<HTMLLabelElement>("overrideSettingsLabel")
const whitelistedValue: HTMLLabelElement = get<HTMLLabelElement>("whitelistedLabel")

// Website Info
const websiteText: HTMLHeadingElement = get<HTMLHeadingElement>("website")
const websiteIcon: HTMLImageElement = get<HTMLImageElement>("websiteIcon")

// Import / Export
const exportButton: HTMLButtonElement = get<HTMLButtonElement>("exportButton")
const exportAnchor: HTMLAnchorElement = get<HTMLAnchorElement>("exportAnchor")
const importButton: HTMLButtonElement = get<HTMLButtonElement>("importButton")
const importInput: HTMLInputElement = get<HTMLInputElement>("importInput")

interface Element {
    currentTask: number;

    postDelayed(millis: number, func: Function);
}

Element.prototype.postDelayed = function (millis: number, func: Function) {
    let localTask = wait(millis, () => {
        if (localTask === this.currentTask) func.call(this)
    })
    this.currentTask = localTask
}

async function initializeUI(): Promise<void> {
    const storage: WudoohStorage = await sync.get(WudoohKeys.all())
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
    sizeValue.innerHTML = textSize.toString() + "%"
    heightSlider.value = lineHeight.toString()
    heightValue.innerHTML = lineHeight.toString() + "%"
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

async function updateAllTabsText(): Promise<void> {
    tabs.sendMessageAllTabs({reason: MessageReasons.updateAllText})
}

async function toggleOnOff(): Promise<void> {
    await sync.set({onOff: onOffSwitch.checked})
    if (onOffSwitch.checked) {
        mainDiv.style.maxHeight = "100%"
        updateAllTabsText()
    } else {
        mainDiv.style.maxHeight = "0"
        tabs.sendMessageAllTabs({reason: MessageReasons.toggleOff})
    }
}

async function updateTextSize(): Promise<void> {
    const newSize: number = parseInt(sizeSlider.value)
    const currentTabs = await tabs.queryCurrentTab()
    const wudoohStorage: WudoohStorage = await sync.get(WudoohKeys.customSettings)

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

async function updateLineHeight(): Promise<void> {
    const newHeight: number = parseInt(heightSlider.value)
    const currentTabs = await tabs.queryCurrentTab()
    const wudoohStorage: WudoohStorage = await sync.get(WudoohKeys.customSettings)

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

async function changeFont(): Promise<void> {
    const newFont: string = fontSelect.value
    const currentTabs = await tabs.queryCurrentTab()
    const wudoohStorage: WudoohStorage = await sync.get(WudoohKeys.customSettings)

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

async function toggleOverrideSiteSettings(): Promise<void> {
    const currentTabs = await tabs.queryCurrentTab()
    const thisURL: string = new URL(currentTabs[0].url).hostname
    let wudoohStorage: WudoohStorage = await sync.get(WudoohKeys.customSettings)
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
    wudoohStorage = await sync.get([WudoohKeys.textSize, WudoohKeys.lineHeight, WudoohKeys.font, WudoohKeys.customSettings])
    customSettings = wudoohStorage.customSettings as Array<CustomSetting>

    let textSize: number
    let lineHeight: number
    let font: string
    let custom: CustomSetting = customSettings.find((custom: CustomSetting) => custom.url === thisURL)
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
    sizeValue.innerHTML = textSize.toString() + "%"
    heightSlider.value = lineHeight.toString()
    heightValue.innerHTML = lineHeight.toString() + "%"
    fontSelect.value = font
    fontSelect.style.fontFamily = font
    updateAllTabsText()
}

async function toggleWhitelist() {
    const currentTabs: Array<Tab> = await tabs.queryCurrentTab()
    const thisURL: string = new URL(currentTabs[0].url).hostname
    const wudoohStorage: WudoohStorage = await sync.get(WudoohKeys.whitelisted)
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

async function exportSettings(): Promise<void> {
    const wudoohStorage: WudoohStorage = await sync.get(WudoohKeys.all())
    const json: string = JSON.stringify(wudoohStorage, null, 4)
    exportAnchor.href = "data:application/octet-stream," + encodeURIComponent(json)
    exportAnchor.download = "wudooh.settings.json"
    exportAnchor.click()
}

async function importSettings(): Promise<void> {
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

        const textSize: number = result[WudoohKeys.textSize]
        const lineHeight: number = result[WudoohKeys.lineHeight]
        const onOff: boolean = result[WudoohKeys.onOff]
        const font: string = result[WudoohKeys.font]
        const whitelisted: Array<string> = result[WudoohKeys.whitelisted]
        const customSettings: Array<CustomSetting> = result[WudoohKeys.customSettings]
        const customFonts: Array<CustomFont> = result[WudoohKeys.customFonts]

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

function popupAddListeners(): void {
    document.addEventListener("DOMContentLoaded", initializeUI)

    onOffSwitch.onclick = () => toggleOnOff()

    fontSelect.oninput = () => changeFont()

    sizeSlider.oninput = () => {
        sizeValue.textContent = sizeSlider.value + "%"
        sizeSlider.postDelayed(defaultDelay, updateTextSize)
    }
    heightSlider.oninput = () => {
        heightValue.textContent = heightSlider.value + "%"
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

popupAddListeners()
