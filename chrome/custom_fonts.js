///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
var template = get("template");
var fontsDiv = get("fontsDiv");
var fontNameInput = get("fontNameInput");
var displayedNameInput = get("displayedNameInput");
var urlInput = get("urlInput");
var addButton = get("addButton");
var infoLabel = get("infoLabel");
var templateDiv = template.content.querySelector("div");
// Use this to reduce the number of requests made to chrome storage
var displayedFonts = [];
function displayFont(customFont) {
    var fontName = customFont.fontName;
    var displayedName = customFont.displayedName;
    var fontUrl = customFont.url;
    var rootDiv = document.importNode(templateDiv, true);
    var inputs = rootDiv.getElementsByTagName("input");
    var fontNameInput = inputs.namedItem("templateFontNameInput");
    var displayedNameInput = inputs.namedItem("templateDisplayedNameInput");
    var urlInput = inputs.namedItem("templateUrlInput");
    var deleteButton = rootDiv.children.namedItem("templateDeleteButton");
    fontNameInput.value = fontName;
    displayedNameInput.value = displayedName;
    urlInput.value = fontUrl;
    rootDiv.id += "-" + customFont;
    fontNameInput.id += "-" + customFont;
    deleteButton.id += "-" + customFont;
    // Temporary variable so that we don't perform a save every time the user leaves the input
    var savedValue = customFont.fontName;
    if (CustomFont.isFontInstalled(customFont.fontName)) {
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
            sync.get({ customFonts: [] }, function (fromStorage) {
                var customFonts = fromStorage.customFonts;
                customFonts = customFonts.filter(function (it) { return it.fontName !== font_1; });
                sync.set({ customFonts: customFonts }, function () {
                    displayedFonts = customFonts.map(function (it) { return it.fontName; });
                    rootDiv.parentNode.removeChild(rootDiv);
                });
            });
        }
    };
    fontsDiv.appendChild(rootDiv);
}
sync.get({ customFonts: [] }, function (fromStorage) {
    var customFonts = fromStorage.customFonts;
    customFonts.forEach(function (it) {
        displayFont(it);
    });
    displayedFonts = customFonts.map(function (it) { return it.fontName; });
});
fontNameInput.oninput = function () {
    if (CustomFont.isFontInstalled(fontNameInput.value)) {
        fontNameInput.style.color = "green";
    }
    else {
        fontNameInput.style.color = "red";
    }
};
fontNameInput.onkeypress = function (event) {
    if (event.code === "Enter")
        addButton.click();
};
addButton.onclick = function () {
    var fontName = fontNameInput.value;
    var displayedName = displayedNameInput.value;
    var url = urlInput.value;
    if (displayedName == "")
        displayedName = null;
    if (url == "")
        url = null;
    var isValid = true;
    if (fontName.length === 0) {
        isValid = false;
        infoLabel.innerText = "Cannot be empty!";
        return;
    }
    if (displayedFonts.contains(fontName)) {
        isValid = false;
        infoLabel.innerText = "Already in list!";
        return;
    }
    // TODO only allow inputs of letters and - and _, no commas and exclamation marks etc
    if (isValid) {
        infoLabel.innerText = "";
        sync.get({ customFonts: [] }, function (fromStorage) {
            var customFonts = fromStorage.customFonts;
            var customFont = new CustomFont(fontName, displayedName, url);
            customFonts.push(customFont);
            sync.set({ customFonts: customFonts }, function () {
                displayFont(customFont);
                infoLabel.style.display = "none";
                fontNameInput.value = "";
                displayedNameInput.value = "";
                urlInput.value = "";
            });
        });
    }
};
// TODO when a new custom font is added or removed send a message to main.ts so that it can reinject CSS
