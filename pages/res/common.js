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
function get(elementId) {
    return document.getElementById(elementId);
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
const arabicFont = "Droid Arabic Naskh";
const farsiFont = "Droid Arabic Naskh";
const langEn = "?lang=en";
const langAr = "?lang=ar";
const langFa = "?lang=fa";
const bannerImageAnchor = get("bannerImageAnchor");
const langs = [en, ar, fa];
const arLangs = [ar, fa];
const isArScript = arLangs.contains(lang);
class Translator {
    constructor(currentLocale, locales) {
        this.defaultLocaleId = "en";
        this.localeIds = [];
        this.locales = [];
        const promises = [];
        this.currentLocaleId = currentLocale;
        this.localeIds = locales;
        this.localeIds.forEach(locale => {
            const file = `./pages/locales/${locale}.json`;
            const promise = fetch(file).then(r => r.json()).then(json => {
                this.locales.push(json);
                this.currentLocale = this.locales.find(it => it["__locale"] == this.currentLocaleId);
                this.defaultLocale = this.locales.find(it => it["__locale"] == this.defaultLocaleId);
            });
            promises.push(promise);
        });
        this.isInitialized = Promise.all(promises);
    }
    async initialize() {
        await this.isInitialized;
    }
    get(id) {
        return this.currentLocale[id] || this.defaultLocale[id];
    }
}
