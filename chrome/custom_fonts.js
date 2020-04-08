///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
var template = get("template");
var fontsDiv = get("fontsDiv");
var newInput = get("newInput");
var addButton = get("addButton");
var infoLabel = get("infoLabel");
var templateDiv = template.content.querySelector("div");
// Use this to reduce the number of requests made to chrome storage
var displayedFonts = [];
function displayFont(font) {
    var rootDiv = document.importNode(templateDiv, true);
    var inputs = rootDiv.getElementsByTagName("input");
    var fontNameInput = inputs.namedItem("fontNameInput");
    var displayedNameInput = inputs.namedItem("displayedNameInput");
    var urlInput = inputs.namedItem("urlInput");
    var deleteButton = rootDiv.children.namedItem("deleteButton");
    fontNameInput.value = font;
    rootDiv.id += "-" + font;
    fontNameInput.id += "-" + font;
    deleteButton.id += "-" + font;
    // Temporary variable so that we don't perform a save every time the user leaves the input
    var savedValue = font;
    if (CustomFont.isFontInstalled(font)) {
        fontNameInput.style.color = "green";
    }
    else {
        fontNameInput.style.color = "red";
    }
    fontNameInput.oninput = function () {
        fontNameInput.size = fontNameInput.value.length;
        if (CustomFont.isFontInstalled(fontNameInput.value)) {
            fontNameInput.style.color = "green";
        }
        else {
            fontNameInput.style.color = "red";
        }
    };
    fontNameInput.onmouseleave = function () {
        // Save only if input value has changed
        if (savedValue !== fontNameInput.value) {
            savedValue = fontNameInput.value;
            console.log("Saved: " + savedValue);
        }
    };
    deleteButton.onclick = function () {
        if (confirm("Are you sure you want to delete " + fontNameInput.value + "\nThis cannot be undone")) {
            var font_1 = fontNameInput.value;
            storage.local.get({ customFonts: [] }, function (fromStorage) {
                var customFonts = fromStorage.customFonts;
                customFonts = customFonts.filter(function (it) { return it !== font_1; });
                storage.local.set({ customFonts: customFonts }, function () {
                    displayedFonts = customFonts;
                    rootDiv.parentNode.removeChild(rootDiv);
                });
            });
        }
    };
    fontsDiv.appendChild(rootDiv);
}
storage.local.get({ customFonts: [] }, function (fromStorage) {
    var customFonts = fromStorage.customFonts;
    customFonts.forEach(function (it) {
        displayFont(it);
    });
    displayedFonts = customFonts;
});
newInput.oninput = function () {
    if (CustomFont.isFontInstalled(newInput.value)) {
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
        var font_2 = newInput.value;
        infoLabel.innerText = "";
        storage.local.get({ customFonts: [] }, function (fromStorage) {
            var customFonts = fromStorage.customFonts;
            customFonts.push(font_2);
            storage.local.set({ customFonts: customFonts }, function () {
                infoLabel.style.display = "none";
                displayFont(newInput.value);
                newInput.value = "";
            });
        });
    }
};
