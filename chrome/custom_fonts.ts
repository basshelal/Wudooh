///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>

let template = get<HTMLTemplateElement>("template");
let fontsDiv = get<HTMLDivElement>("fontsDiv");
let newInput = get<HTMLInputElement>("newInput");
let addButton = get<HTMLButtonElement>("addButton");

let array = ["Hi", "Hello", "Greetings", "Hola", "Hello There!"];

let templateDiv = template.content.querySelector("div");

function addFont(it: string) {
    let rootDiv = document.importNode(templateDiv, true);
    let label = rootDiv.children.namedItem("label") as HTMLLabelElement;
    let input = rootDiv.children.namedItem("input") as HTMLInputElement;
    let deleteButton = rootDiv.children.namedItem("deleteButton") as HTMLButtonElement;

    label.innerText = it;
    input.value = it;
    input.size = it.length;

    rootDiv.id += `-${it}`;
    label.id += `-${it}`;
    input.id += `-${it}`;
    label.htmlFor = input.id;
    deleteButton.id += `-${it}`;

    let savedValue: string = it;

    input.oninput = () => {
        let value = input.value;

        input.size = value.length;
        label.innerText = value;
    };

    label.onmouseenter = () => {
        input.style.display = "inline";
        label.style.display = "none";
        savedValue = input.value;
    };

    input.onmouseleave = () => {
        input.style.display = "none";
        label.style.display = "inline";
        if (savedValue !== input.value) {
            savedValue = input.value;
            console.log(`Saved: ${savedValue}`)
        }
    };

    deleteButton.onclick = () => {
        if (confirm(`Are you sure you want to delete ${input.value}\nThis cannot be undone`)) {
            rootDiv.parentNode.removeChild(rootDiv);
        }
    };

    fontsDiv.appendChild(rootDiv);
}

array.forEach((it: string) => addFont(it));

newInput.onkeypress = (event: KeyboardEvent) => {
    if (event.code === "Enter") addButton.click();
};

addButton.onclick = () => {
    let value = newInput.value;
    if (value.length !== 0) {
        addFont(newInput.value);
        newInput.value = "";
    }
};