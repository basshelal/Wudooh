// region Extensions
/**
 * Finds the first element that matches the given {@param predicate} else returns null
 * You can use this as a way to check if the array contains an element that matches the given {@param predicate}, it
 * will return null if none exists
 * @param predicate the predicate to match
 */
Array.prototype.findFirst = function (predicate) {
    for (var i = 0; i < this.length; i++) {
        if (predicate(this[i], i))
            return this[i];
    }
    return null;
};
Array.prototype.contains = function (element) {
    return this.findFirst(function (it) {
        return it === element;
    }) !== null;
};
// endregion Extensions
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
var langQueryParamPrefix = "?lang=";
var langQueryParam = langQueryParamPrefix + lang;
var en = "en";
var ar = "ar";
var fa = "fa";
var langs = [en, ar, fa];
var arLangs = [ar, fa];
var isArScript = arLangs.contains(lang);
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
function translation(element, translations) {
    return new ElementTranslationMapping(element, translations);
}
