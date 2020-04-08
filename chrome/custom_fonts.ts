///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>

const template = get<HTMLTemplateElement>("template");
const fontsDiv = get<HTMLDivElement>("fontsDiv");
const newInput = get<HTMLInputElement>("newInput");
const addButton = get<HTMLButtonElement>("addButton");
const infoLabel = get<HTMLParagraphElement>("infoLabel");
const templateDiv = template.content.querySelector("div");

// Use this to reduce the number of requests made to chrome storage
let displayedFonts: Array<string> = [];


function displayFont(font: string) {
    let rootDiv = document.importNode(templateDiv, true);
    let inputs = rootDiv.getElementsByTagName("input");
    const fontNameInput = inputs.namedItem("fontNameInput") as HTMLInputElement;
    const displayedNameInput = inputs.namedItem("displayedNameInput") as HTMLInputElement;
    const urlInput = inputs.namedItem("urlInput") as HTMLInputElement;
    let deleteButton = rootDiv.children.namedItem("deleteButton") as HTMLButtonElement;

    fontNameInput.value = font;

    rootDiv.id += `-${font}`;
    fontNameInput.id += `-${font}`;
    deleteButton.id += `-${font}`;

    // Temporary variable so that we don't perform a save every time the user leaves the input
    let savedValue: string = font;

    if (CustomFont.isFontInstalled(font)) {
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
            storage.local.get({customFonts: []}, (fromStorage) => {
                let customFonts: Array<string> = fromStorage.customFonts as Array<string>;
                customFonts = customFonts.filter((it: string) => it !== font);
                storage.local.set({customFonts: customFonts}, () => {
                    displayedFonts = customFonts;
                    rootDiv.parentNode.removeChild(rootDiv);
                });
            });
        }
    };

    fontsDiv.appendChild(rootDiv);
}

storage.local.get({customFonts: []}, (fromStorage) => {
    let customFonts: Array<string> = fromStorage.customFonts as Array<string>;
    customFonts.forEach((it: string) => {
        displayFont(it);
    });
    displayedFonts = customFonts;
});

newInput.oninput = () => {
    if (CustomFont.isFontInstalled(newInput.value)) {
        newInput.style.color = "green";
    } else {
        newInput.style.color = "red";
    }
};

newInput.onkeypress = (event: KeyboardEvent) => {
    if (event.code === "Enter") addButton.click();
};

addButton.onclick = () => {
    let value = newInput.value;
    let isValid = true;

    if (value.length === 0) {
        isValid = false;
        infoLabel.innerText = "Cannot be empty!";
        return;
    }
    if (displayedFonts.contains(value)) {
        isValid = false;
        infoLabel.innerText = "Already in list!";
        return;
    }
    // TODO only allow inputs of letters and - and _, no commas and exclamation marks etc
    if (isValid) {
        let font = newInput.value;
        infoLabel.innerText = "";
        storage.local.get({customFonts: []}, (fromStorage) => {
            let customFonts: Array<string> = fromStorage.customFonts as Array<string>;
            customFonts.push(font);
            storage.local.set({customFonts: customFonts}, () => {
                infoLabel.style.display = "none";
                displayFont(newInput.value);
                newInput.value = "";
            });
        });
    }
};