///<reference path="./shared.ts"/>

const template = get<HTMLTemplateElement>("template")
const fontsDiv = get<HTMLDivElement>("fontsDiv")
const fontNameInput = get<HTMLInputElement>("fontNameInput")
const localNameInput = get<HTMLInputElement>("localNameInput")
const urlInput = get<HTMLInputElement>("urlInput")
const addButton = get<HTMLButtonElement>("addButton")
const infoLabel = get<HTMLParagraphElement>("infoLabel")
const fontTest = get("fontTest")
const templateDiv = template.content.querySelector("div")

// Use this to reduce the number of requests made to chrome storage
let displayedFonts: Array<string> = []

async function initializeCustomFonts() {
    const storage: WudoohStorage = await sync.get([keyCustomFonts])
    displayedFonts = []
    storage.customFonts.forEach((it: CustomFont) => {
        displayFont(it)
        displayedFonts.push(it.fontName)
    })
}

async function injectTemporaryCustomFont(customFont: CustomFont) {
    let customFontsStyle = get("wudoohCustomFontsStyle")
    if (!customFontsStyle) {
        customFontsStyle = document.createElement("style")
        customFontsStyle.id = "wudoohCustomFontsStyle"
        document.head.append(customFontsStyle)
    }
    customFontsStyle.innerHTML = CustomFont.injectCSS(customFont)
}

async function notifyAllTabsCustomFontsChanged(customFonts: Array<CustomFont>) {
    const allTabs = await tabs.queryAllTabs()
    allTabs.forEach((tab: Tab) => {
        let message = {
            reason: reasonInjectCustomFonts,
            customFonts: customFonts
        }
        tabs.sendMessage(tab.id, message)
    })
}

function displayFont(customFont: CustomFont) {
    const fontName: string = customFont.fontName
    const localName: string = customFont.localName
    const fontUrl: string = customFont.url

    const rootDiv = document.importNode(templateDiv, true)
    const fontTitle = rootDiv.children.namedItem("templateFontTitle") as HTMLDivElement
    const inputs = rootDiv.getElementsByTagName("input")
    const fontNameInput = inputs.namedItem("templateFontNameInput") as HTMLInputElement
    const urlInput = inputs.namedItem("templateUrlInput") as HTMLInputElement
    const localNameInput = inputs.namedItem("templateLocalNameInput") as HTMLInputElement
    const deleteButton = rootDiv.children.namedItem("templateDeleteButton") as HTMLButtonElement
    const checkIcon = rootDiv.children.namedItem("templateCheckIcon") as HTMLSpanElement
    const errorIcon = rootDiv.children.namedItem("templateErrorIcon") as HTMLSpanElement
    const infoText = rootDiv.children.namedItem("templateInfoText") as HTMLDivElement
    const allElements: Array<HTMLElement> =
        [rootDiv, fontTitle, fontNameInput, urlInput, localNameInput, deleteButton, checkIcon, errorIcon, infoText]

    checkIcon.style.display = "none"
    errorIcon.style.display = "none"

    fontNameInput.value = fontName
    urlInput.value = fontUrl
    localNameInput.value = localName

    const idSuffix = `-${customFont.fontName}`
    allElements.forEach(element => element.id += idSuffix)

    fontsDiv.appendChild(rootDiv);

    deleteButton.onclick = () => {
        if (confirm(`Are you sure you want to delete ${fontNameInput.value}\nThis cannot be undone`)) {
            let font = fontNameInput.value;
            let customFonts: Array<CustomFont>;
            sync.get([keyCustomFonts]).then((storage: WudoohStorage) => {
                customFonts = storage.customFonts.filter((it: CustomFont) => it.fontName !== font);
                return sync.set({customFonts: customFonts});
            }).then(() => {
                notifyAllTabsCustomFontsChanged(customFonts);
                displayedFonts = customFonts.map(it => it.fontName);
                rootDiv.parentNode.removeChild(rootDiv);
            });
        }
    };
}

function inputOnInput() {
    this.postDelayed(250, () => {
        const fontName = fontNameInput.value
        const url = urlInput.value
        const localName = localNameInput.value
        injectTemporaryCustomFont(new CustomFont(fontName, localName, url))
        fontTest.style.fontFamily = fontName
    });
}

async function addButtonOnClick() {
    let fontName = fontNameInput.value
    let url = urlInput.value
    let localName = localNameInput.value

    if (fontName == "") fontName = null
    if (url == "") url = null
    if (localName == "") localName = null

    if (!fontName) {
        infoLabel.style.display = "block"
        infoLabel.innerText = "Font Name cannot be empty!"
        return
    }
    if (!url && !localName) {
        infoLabel.style.display = "block"
        infoLabel.innerText = "URL and local cannot both be empty!"
        return
    }
    if (displayedFonts.contains(fontName) || allWudoohFonts.contains(fontName)) {
        infoLabel.style.display = "block"
        infoLabel.innerText = "A font with this Font Name already exists!"
        return
    }

    // If we reached here then all is valid!
    infoLabel.innerText = ""

    const storage: WudoohStorage = await sync.get([keyCustomFonts])
    const customFonts: Array<CustomFont> = storage.customFonts
    const customFont: CustomFont = new CustomFont(fontName, localName, url)
    customFonts.push(customFont)
    await sync.set({customFonts: customFonts})

    displayFont(customFont)
    displayedFonts.push(customFont.fontName)
    notifyAllTabsCustomFontsChanged(customFonts)
    infoLabel.style.display = "none"
    fontNameInput.value = ""
    urlInput.value = ""
    localNameInput.value = ""
}

function customFontsAddListeners() {
    function pressedEnter(event: KeyboardEvent) {
        if (event.code === "Enter") addButton.click()
    }

    document.addEventListener("DOMContentLoaded", initializeCustomFonts)

    fontNameInput.onkeypress = pressedEnter
    localNameInput.onkeypress = pressedEnter
    urlInput.onkeypress = pressedEnter

    fontNameInput.oninput = inputOnInput
    localNameInput.oninput = inputOnInput
    urlInput.oninput = inputOnInput

    addButton.onclick = addButtonOnClick
}

customFontsAddListeners()