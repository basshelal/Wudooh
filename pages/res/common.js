function include(path, onload) {
    if (onload === void 0) {
        onload = function () {
        };
    }
    var script = document.createElement("script");
    script.src = path;
    script.defer = true;
    document.head.appendChild(script);
    console.log("Added script: " + script.src);
    script.onload = function () {
        console.log("Loaded script: " + script.src);
        onload();
    };
}

var urlParams = new URLSearchParams(window.location.search);
var lang = urlParams.get("lang") || "en";
var arFont = "Droid Arabic Naskh";
var faFont = "Droid Arabic Naskh";
var langEn = "?lang=en";
var langAr = "?lang=ar";
var langFa = "?lang=fa";
var langs = [langEn, langAr, langFa];
var rtlLangs = [langAr, langFa];
var arScriptLangs = [langAr, langFa];
var isArScript = lang in arScriptLangs;
var ElementTranslationMapping = /** @class */ (function () {
    function ElementTranslationMapping(element, translations) {
        var _this = this;
        this.element = element;
        // @ts-ignore
        this.translations = new Map();
        translations.forEach(function (it) {
            _this.addTranslation(it["lang"], it["translation"]);
        });
    }

    ElementTranslationMapping.prototype.addTranslation = function (lang, translation) {
        this.translations.set(lang, translation);
    };
    return ElementTranslationMapping;
}());
