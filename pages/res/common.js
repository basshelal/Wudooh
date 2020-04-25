Array.prototype.findFirst = function (predicate) {
    for (let i = 0; i < this.length; i++) {
        if (predicate(this[i], i))
            return this[i];
    }
    return null;
};
Array.prototype.contains = function (element) {
    return !!this.findFirst((it) => it === element);
};

function include(path, onload = () => {
}) {
    let script = document.createElement("script");
    script.src = path;
    script.defer = true;
    document.head.appendChild(script);
    console.log(`Added script: ${script.src}`);
    script.onload = () => {
        console.log(`Loaded script: ${script.src}`);
        onload();
    };
}

const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get("lang") || "en";
const arFont = "Droid Arabic Naskh";
const faFont = "Droid Arabic Naskh";
const langQueryParamPrefix = "?lang=";
const langQueryParam = langQueryParamPrefix + lang;
const en = "en";
const ar = "ar";
const fa = "fa";
const langs = [en, ar, fa];
const arLangs = [ar, fa];
const isArScript = arLangs.contains(lang);

class ElementTranslationMapping {
    constructor(element, translations) {
        this.element = element;
        this.translations = new Map();
        translations.forEach((it) => {
            this.addTranslation(it["lang"], it["translation"]);
        });
    }

    addTranslation(lang, translation) {
        this.translations.set(lang, translation);
    }
}
function translation(element, translations) {
    return new ElementTranslationMapping(element, translations);
}
