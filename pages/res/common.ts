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

const langEn: string = "?lang=en";
const langAr: string = "?lang=ar";
const langFa: string = "?lang=fa";

const langs = [langEn, langAr, langFa];
const rtlLangs = [langAr, langFa];
const arScriptLangs = [langAr, langFa];

const isArScript: boolean = lang in arScriptLangs;

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