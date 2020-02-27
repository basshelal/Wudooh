///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
var template = get("template");
var fontsDiv = get("fontsDiv");
var newInput = get("newInput");
var addButton = get("addButton");
var array = ["Hi", "Hello", "Greetings", "Hola", "Hello There!"];
var templateDiv = template.content.querySelector("div");
function addFont(it) {
    var rootDiv = document.importNode(templateDiv, true);
    var label = rootDiv.children.namedItem("label");
    var input = rootDiv.children.namedItem("input");
    var deleteButton = rootDiv.children.namedItem("deleteButton");
    label.innerText = it;
    input.value = it;
    input.size = it.length;
    rootDiv.id += "-" + it;
    label.id += "-" + it;
    input.id += "-" + it;
    label.htmlFor = input.id;
    deleteButton.id += "-" + it;
    var savedValue = it;
    input.oninput = function () {
        var value = input.value;
        input.size = value.length;
        label.innerText = value;
    };
    label.onmouseenter = function () {
        input.style.display = "inline";
        label.style.display = "none";
        savedValue = input.value;
    };
    input.onmouseleave = function () {
        input.style.display = "none";
        label.style.display = "inline";
        if (savedValue !== input.value) {
            savedValue = input.value;
            console.log("Saved: " + savedValue);
        }
    };
    deleteButton.onclick = function () {
        if (confirm("Are you sure you want to delete " + input.value + "\nThis cannot be undone")) {
            rootDiv.parentNode.removeChild(rootDiv);
        }
    };
    fontsDiv.appendChild(rootDiv);
}
array.forEach(function (it) { return addFont(it); });
newInput.onkeypress = function (event) {
    if (event.code === "Enter")
        addButton.click();
};
addButton.onclick = function () {
    var value = newInput.value;
    if (value.length !== 0) {
        addFont(newInput.value);
        newInput.value = "";
    }
};
