///<reference path="../../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>

const template = get<HTMLTemplateElement>("template");
const fontsDiv = get<HTMLDivElement>("fontsDiv");
const fontNameInput = get<HTMLInputElement>("fontNameInput");
const displayedNameInput = get<HTMLInputElement>("displayedNameInput");
const urlInput = get<HTMLInputElement>("urlInput");
const addButton = get<HTMLButtonElement>("addButton");
const infoLabel = get<HTMLParagraphElement>("infoLabel");
const templateDiv = template.content.querySelector("div");

// Use this to reduce the number of requests made to chrome storage
let displayedFonts: Array<string> = [];

function notifyCustomFontsChanged(customFonts: Array<CustomFont>) {
    tabs.queryAllTabs().then((allTabs: Array<Tab>) => {
        allTabs.forEach((tab: Tab) => {
            let message = {
                reason: reasonInjectCustomFonts,
                customFonts: customFonts
            };
            tabs.sendMessage(tab.id, message);
        });
    });
}

function displayFont(customFont: CustomFont) {
    const fontName: string = customFont.fontName;
    const displayedName: string = customFont.displayedName;
    const fontUrl: string = customFont.url;

    let rootDiv = document.importNode(templateDiv, true);
    let inputs = rootDiv.getElementsByTagName("input");
    const fontNameInput = inputs.namedItem("templateFontNameInput") as HTMLInputElement;
    const displayedNameInput = inputs.namedItem("templateDisplayedNameInput") as HTMLInputElement;
    const urlInput = inputs.namedItem("templateUrlInput") as HTMLInputElement;
    let deleteButton = rootDiv.children.namedItem("templateDeleteButton") as HTMLButtonElement;

    fontNameInput.value = fontName;
    displayedNameInput.value = displayedName;
    urlInput.value = fontUrl;

    rootDiv.id += `-${customFont}`;
    fontNameInput.id += `-${customFont}`;
    deleteButton.id += `-${customFont}`;

    // Temporary variable so that we don't perform a save every time the user leaves the input
    let savedValue: string = customFont.fontName;

    if (CustomFont.isFontInstalled(customFont.fontName)) {
        fontNameInput.style.color = "green";
    } else {
        fontNameInput.style.color = "red";
    }

    fontNameInput.oninput = () => {
        fontNameInput.size = fontNameInput.value.length;
        if (CustomFont.isFontInstalled(fontNameInput.value)) {
            fontNameInput.style.color = "green";
        } else {
            fontNameInput.style.color = "red";
        }
    };

    fontNameInput.onmouseleave = () => {

        // Save only if input value has changed
        if (savedValue !== fontNameInput.value) {
            savedValue = fontNameInput.value;
            console.log(`Saved: ${savedValue}`)
        }
    };

    deleteButton.onclick = () => {
        if (confirm(`Are you sure you want to delete ${fontNameInput.value}\nThis cannot be undone`)) {
            let font = fontNameInput.value;
            let customFonts: Array<CustomFont>;
            sync.get([keyCustomFonts]).then((storage: WudoohStorage) => {
                customFonts = storage.customFonts.filter((it: CustomFont) => it.fontName !== font);
                return sync.set({customFonts: customFonts});
            }).then(() => {
                notifyCustomFontsChanged(customFonts);
                displayedFonts = customFonts.map(it => it.fontName);
                rootDiv.parentNode.removeChild(rootDiv);
            });
        }
    };

    fontsDiv.appendChild(rootDiv);

    let injectedCss = `@font-face { font-family: '${fontName}'; src: local('${fontName}')`;
    if (fontUrl) injectedCss = injectedCss.concat(`, url('${fontUrl}')`);
    injectedCss = injectedCss.concat(`; }\n`);

    let fontsStyle = get("customFontsStyle");
    fontsStyle.innerHTML = fontsStyle.innerHTML.concat(injectedCss);

}

sync.get([keyCustomFonts]).then((storage: WudoohStorage) => {
    let customFonts: Array<CustomFont> = storage.customFonts;
    displayedFonts = [];
    customFonts.forEach((it: CustomFont) => {
        displayFont(it);
        displayedFonts.push(it.fontName)
    });
});

fontNameInput.oninput = () => {
    if (CustomFont.isFontInstalled(fontNameInput.value)) {
        fontNameInput.style.color = "green";
    } else {
        fontNameInput.style.color = "red";
    }
};

function pressedEnter(event: KeyboardEvent) {
    if (event.code === "Enter") addButton.click();
}

fontNameInput.onkeypress = pressedEnter;
displayedNameInput.onkeypress = pressedEnter;
urlInput.onkeypress = pressedEnter;

addButton.onclick = () => {
    let fontName = fontNameInput.value;
    let displayedName = displayedNameInput.value;
    let url = urlInput.value;

    if (displayedName == "") displayedName = null;
    if (url == "") url = null;

    let isValid = true;

    if (fontName.length === 0) {
        isValid = false;
        infoLabel.style.display = "block";
        infoLabel.innerText = "Cannot be empty!";
        return;
    }
    if (displayedFonts.contains(fontName)) {
        isValid = false;
        infoLabel.style.display = "block";
        infoLabel.innerText = "Already in list!";
        return;
    }
    // TODO only allow inputs of letters and - and _, no commas and exclamation marks etc
    if (isValid) {
        infoLabel.innerText = "";
        let customFonts: Array<CustomFont>;
        let customFont: CustomFont;
        sync.get([keyCustomFonts]).then((storage: WudoohStorage) => {
            customFonts = storage.customFonts;
            customFont = new CustomFont(fontName, displayedName, url);
            customFonts.push(customFont);
            return sync.set({customFonts: customFonts});
        }).then(() => {
            displayFont(customFont);
            displayedFonts.push(customFont.fontName);
            notifyCustomFontsChanged(customFonts);
            infoLabel.style.display = "none";
            fontNameInput.value = "";
            displayedNameInput.value = "";
            urlInput.value = "";
        });
    }
};