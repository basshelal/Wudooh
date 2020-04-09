///<reference path="../../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
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
function notifyCustomFontsChanged(customFonts) {
    tabs.queryAllTabs().then(function (allTabs) {
        allTabs.forEach(function (tab) {
            var message = {
                reason: reasonInjectCustomFonts,
                customFonts: customFonts
            };
            tabs.sendMessage(tab.id, message);
        });
    });
}
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
            var customFonts_1;
            sync.get([keyCustomFonts]).then(function (storage) {
                customFonts_1 = storage.customFonts.filter(function (it) { return it.fontName !== font_1; });
                return sync.set({ customFonts: customFonts_1 });
            }).then(function () {
                notifyCustomFontsChanged(customFonts_1);
                displayedFonts = customFonts_1.map(function (it) { return it.fontName; });
                rootDiv.parentNode.removeChild(rootDiv);
            });
        }
    };
    fontsDiv.appendChild(rootDiv);
    var injectedCss = "@font-face { font-family: '" + fontName + "'; src: local('" + fontName + "')";
    if (fontUrl)
        injectedCss = injectedCss.concat(", url('" + fontUrl + "')");
    injectedCss = injectedCss.concat("; }\n");
    var fontsStyle = get("customFontsStyle");
    fontsStyle.innerHTML = fontsStyle.innerHTML.concat(injectedCss);
}
sync.get([keyCustomFonts]).then(function (storage) {
    var customFonts = storage.customFonts;
    displayedFonts = [];
    customFonts.forEach(function (it) {
        displayFont(it);
        displayedFonts.push(it.fontName);
    });
});
fontNameInput.oninput = function () {
    if (CustomFont.isFontInstalled(fontNameInput.value)) {
        fontNameInput.style.color = "green";
    }
    else {
        fontNameInput.style.color = "red";
    }
};
function pressedEnter(event) {
    if (event.code === "Enter")
        addButton.click();
}
fontNameInput.onkeypress = pressedEnter;
displayedNameInput.onkeypress = pressedEnter;
urlInput.onkeypress = pressedEnter;
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
        var customFonts_2;
        var customFont_1;
        sync.get([keyCustomFonts]).then(function (storage) {
            customFonts_2 = storage.customFonts;
            customFont_1 = new CustomFont(fontName, displayedName, url);
            customFonts_2.push(customFont_1);
            return sync.set({ customFonts: customFonts_2 });
        }).then(function () {
            displayFont(customFont_1);
            displayedFonts.push(customFont_1.fontName);
            notifyCustomFontsChanged(customFonts_2);
            infoLabel.style.display = "none";
            fontNameInput.value = "";
            displayedNameInput.value = "";
            urlInput.value = "";
        });
    }
};
