// region Extensions

interface Array<T> {
    findFirst(predicate: (element: T, index: number) => boolean): T | null;

    contains(element: T): boolean;
}

/**
 * Finds the first element that matches the given {@param predicate} else returns null
 * You can use this as a way to check if the array contains an element that matches the given {@param predicate}, it
 * will return null if none exists
 * @param predicate the predicate to match
 */
Array.prototype.findFirst = function <T>(predicate: (element: T, index: number) => boolean): T | null {
    for (let i = 0; i < this.length; i++) {
        if (predicate(this[i], i)) return this[i];
    }
    return null;
};

Array.prototype.contains = function <T>(element: T): boolean {
    return !!this.findFirst((it: T) => it === element);
};

// endregion Extensions

function get<T extends HTMLElement>(elementId: string): T | null {
    return document.getElementById(elementId) as T
}

const urlParams: URLSearchParams = new URLSearchParams(window.location.search);

const lang: string = urlParams.get("lang") || "en";

const arFont: string = "Droid Arabic Naskh";
const faFont: string = "Droid Arabic Naskh";

const langQueryParamPrefix: string = "?lang=";
const langQueryParam: string = langQueryParamPrefix + lang;

const en: string = "en";
const ar: string = "ar";
const fa: string = "fa";

const arabicFont: string = "Droid Arabic Naskh";
const farsiFont: string = "Droid Arabic Naskh";

const langEn: string = "?lang=en";
const langAr: string = "?lang=ar";
const langFa: string = "?lang=fa";

const bannerImageAnchor = get<HTMLAnchorElement>("bannerImageAnchor");

const langs = [en, ar, fa];
const arLangs = [ar, fa];

const isArScript: boolean = arLangs.contains(lang);

class Translator {

    public currentLocaleId: string
    public defaultLocaleId: string = "en"
    public localeIds: Array<string> = []
    private locales: Array<any> = []
    private currentLocale: any
    private defaultLocale: any
    private isInitialized: Promise<any>

    constructor(currentLocale: string, locales: Array<string>) {
        const promises: Array<Promise<any>> = []
        this.currentLocaleId = currentLocale
        this.localeIds = locales
        this.localeIds.forEach(locale => {
            const file = `./pages/_locales/${locale}.json`
            const promise = fetch(file).then(r => r.json()).then(json => {
                this.locales.push(json)
                this.currentLocale = this.locales.find(it => it["__locale"] == this.currentLocaleId)
                this.defaultLocale = this.locales.find(it => it["__locale"] == this.defaultLocaleId)
            })
            promises.push(promise)
        })
        this.isInitialized = Promise.all(promises)
    }

    async initialize() {
        await this.isInitialized
    }

    get(id: string): string {
        return this.currentLocale[id] || this.defaultLocale[id]
    }
}
