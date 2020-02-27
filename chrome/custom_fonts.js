///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
var template = get("template");
var fontsDiv = get("fontsDiv");
var newInput = get("newInput");
var addButton = get("addButton");
var errorLabel = get("errorLabel");
var fromStorage = ["Hi", "Hello", "Greetings", "Hola", "Hallo"];
// Use this to reduce the number of requests made to chrome storage
var displayedFonts = [];
var templateDiv = template.content.querySelector("div");
function isFontAvailable(font) {
    var container = document.createElement('span');
    container.innerHTML = Array(100).join('wi');
    container.style.cssText = [
        'position:absolute',
        'width:auto',
        'font-size:128px',
        'left:-99999px'
    ].join(' !important;');
    function getWidth(fontFamily) {
        container.style.fontFamily = fontFamily;
        document.body.appendChild(container);
        var width = container.clientWidth;
        document.body.removeChild(container);
        return width;
    }
    // Pre compute the widths of monospace, serif & sans-serif
    // to improve performance.
    var monoWidth = getWidth('monospace');
    var serifWidth = getWidth('serif');
    var sansWidth = getWidth('sans-serif');
    return monoWidth !== getWidth(font + ',monospace') ||
        sansWidth !== getWidth(font + ',sans-serif') ||
        serifWidth !== getWidth(font + ',serif');
}
function addFont(font) {
    var rootDiv = document.importNode(templateDiv, true);
    var label = rootDiv.children.namedItem("label");
    var input = rootDiv.children.namedItem("input");
    var deleteButton = rootDiv.children.namedItem("deleteButton");
    label.innerText = font;
    input.value = font;
    input.size = font.length;
    rootDiv.id += "-" + font;
    label.id += "-" + font;
    input.id += "-" + font;
    label.htmlFor = input.id;
    deleteButton.id += "-" + font;
    // Temporary variable so that we don't perform a save every time the user leaves the input
    var savedValue = font;
    if (isFontAvailable(font)) {
        label.style.color = "green";
        input.style.color = "green";
        label.style.fontFamily = font;
    }
    else {
        label.style.color = "red";
        input.style.color = "red";
    }
    input.oninput = function () {
        input.size = input.value.length;
        label.innerText = input.value;
        if (isFontAvailable(input.value)) {
            input.style.color = "green";
            label.style.color = "green";
        }
        else {
            input.style.color = "red";
            label.style.color = "red";
        }
    };
    label.onmouseenter = function () {
        input.style.display = "inline";
        label.style.display = "none";
        savedValue = input.value;
    };
    input.onmouseleave = function () {
        input.style.display = "none";
        label.style.display = "inline";
        // Save only if input value has changed
        if (savedValue !== input.value) {
            savedValue = input.value;
            console.log("Saved: " + savedValue);
        }
    };
    deleteButton.onclick = function () {
        if (confirm("Are you sure you want to delete " + input.value + "\nThis cannot be undone")) {
            displayedFonts.splice(displayedFonts.indexOf(input.value));
            rootDiv.parentNode.removeChild(rootDiv);
        }
    };
    fontsDiv.appendChild(rootDiv);
    displayedFonts.push(font);
}
fromStorage.forEach(function (it) { return addFont(it); });
newInput.oninput = function () {
    if (isFontAvailable(newInput.value)) {
        newInput.style.color = "green";
    }
    else {
        newInput.style.color = "red";
    }
};
newInput.onkeypress = function (event) {
    if (event.code === "Enter")
        addButton.click();
};
addButton.onclick = function () {
    var value = newInput.value;
    var isValid = true;
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
        errorLabel.style.display = "none";
        addFont(newInput.value);
        newInput.value = "";
    }
};
