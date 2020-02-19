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
    return this.findFirst((it) => it === element) !== null;
};

// endregion Extensions

function include(path: string, onload: () => any = () => {
}) {
    let script: HTMLScriptElement = document.createElement("script");
    script.src = path;
    script.defer = true;

    document.head.appendChild(script);

    console.log(`Added script: ${script.src}`);

    script.onload = () => {
        console.log(`Loaded script: ${script.src}`);
        onload();
    };
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

const langs = [en, ar, fa];
const arLangs = [ar, fa];

const isArScript: boolean = arLangs.contains(lang);

// @ts-ignore
// Key is Language, Value is Translation
type Translations = Map<string, string>;

class ElementTranslationMapping {
    element: HTMLElement;
    translations: Translations;

    constructor(element: HTMLElement, translations: Array<object>) {
        this.element = element;
        // @ts-ignore
        this.translations = new Map<string, string>();
        translations.forEach((it) => {
            this.addTranslation(it["lang"], it["translation"]);
        });
    }

    addTranslation(lang: string, translation: string) {
        this.translations.set(lang, translation);
    }
}

function translation(element: HTMLElement, translations: Array<object>): ElementTranslationMapping {
    return new ElementTranslationMapping(element, translations)
}