///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>

let template = get<HTMLTemplateElement>("template");
let fontsDiv = get<HTMLDivElement>("fontsDiv");
let newInput = get<HTMLInputElement>("newInput");
let addButton = get<HTMLButtonElement>("addButton");
let errorLabel = get<HTMLLabelElement>("errorLabel");

// Use this to reduce the number of requests made to chrome storage
let displayedFonts: Array<string> = [];

let templateDiv = template.content.querySelector("div");

function displayFont(font: string) {
    let rootDiv = document.importNode(templateDiv, true);
    let label = rootDiv.children.namedItem("label") as HTMLLabelElement;
    let input = rootDiv.children.namedItem("input") as HTMLInputElement;
    let deleteButton = rootDiv.children.namedItem("deleteButton") as HTMLButtonElement;

    label.innerText = font;
    input.value = font;
    input.size = font.length;

    rootDiv.id += `-${font}`;
    label.id += `-${font}`;
    input.id += `-${font}`;
    label.htmlFor = input.id;
    deleteButton.id += `-${font}`;

    // Temporary variable so that we don't perform a save every time the user leaves the input
    let savedValue: string = font;

    if (CustomFont.isFontInstalled(font)) {
        label.style.color = "green";
        input.style.color = "green";
        label.style.fontFamily = font;
    } else {
        label.style.color = "red";
        input.style.color = "red";
    }

    input.oninput = () => {
        input.size = input.value.length;
        label.innerText = input.value;
        if (CustomFont.isFontInstalled(input.value)) {
            input.style.color = "green";
            label.style.color = "green";
        } else {
            input.style.color = "red";
            label.style.color = "red";
        }
    };

    label.onmouseenter = () => {
        input.style.display = "inline";
        label.style.display = "none";
        savedValue = input.value;
    };

    input.onmouseleave = () => {
        input.style.display = "none";
        label.style.display = "inline";

        // Save only if input value has changed
        if (savedValue !== input.value) {
            savedValue = input.value;
            console.log(`Saved: ${savedValue}`)
        }
    };

    deleteButton.onclick = () => {
        if (confirm(`Are you sure you want to delete ${input.value}\nThis cannot be undone`)) {
            let font = input.value;
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
        errorLabel.style.display = "inline";
        errorLabel.innerText = "Cannot be empty!";
        return;
    }
    if (displayedFonts.contains(value)) {
        isValid = false;
        errorLabel.style.display = "inline";
        errorLabel.innerText = "Already in list!";
        return;
    }
    // TODO only allow inputs of letters and - and _, no commas and exclamation marks etc
    if (isValid) {
        let font = newInput.value;
        storage.local.get({customFonts: []}, (fromStorage) => {
            let customFonts: Array<string> = fromStorage.customFonts as Array<string>;
            customFonts.push(font);
            storage.local.set({customFonts: customFonts}, () => {
                errorLabel.style.display = "none";
                displayFont(newInput.value);
                newInput.value = "";
            });
        });
    }
};