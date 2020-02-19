///<reference path="../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/jquery/misc.d.ts"/>
///<reference path="pages/res/common.ts"/>

function get<T extends HTMLElement>(elementId: string): T | null {
    return document.getElementById(elementId) as T
}

// Text Elements
const shortBlurb = get<HTMLHeadingElement>("shortBlurb");
const download = get<HTMLHeadingElement>("download");
const pages = get<HTMLHeadingElement>("pages");
const faq = get<HTMLAnchorElement>("faq");
const fonts = get<HTMLAnchorElement>("fonts");
const changelog = get<HTMLAnchorElement>("changelog");
const textElements: Array<HTMLElement> = [shortBlurb, download, pages, faq, fonts, changelog];
const refElements: Array<HTMLElement> = [faq, fonts, changelog];

const mappings: Array<ElementTranslationMapping> = [
    new ElementTranslationMapping(
        shortBlurb, [
            {lang: "en", translation: "Hello!"},
            {lang: "ar", translation: "Marhaba!"},
            {lang: "fa", translation: "Salam!"},
        ]
    )
];

function i18n() {
    mappings.forEach((it: ElementTranslationMapping) => {
        it.element.innerText = it.translations.get(lang);
    });
}

function en() {
    document.documentElement.lang = "en";
    document.dir = "ltr";

    shortBlurb.innerHTML =
        `Wudooh <a href=\"https://en.wiktionary.org/wiki/%D9%88%D8%B6%D9%88%D8%AD\" style=\"margin: 0\" target=\"_blank\"> 
        (clarity in Arabic and Persian)</a>
        is a simple browser extension that makes reading Arabic script text clearer and more pleasant.`;
    download.innerHTML = "Download for free";
    pages.innerHTML = "Pages";
    faq.innerHTML = "Frequently Asked Questions";
    fonts.innerHTML = "Fonts";
    changelog.innerHTML = "Changelog";

    faq.href += langEn;
    fonts.href += langEn;
    changelog.href += langEn;

}

function ar() {
    document.documentElement.lang = "ar";

    shortBlurb.innerHTML = `"وضوح" إضافة بسيطة لمتصفح الأنترنت تجعل قراءة الحروف العربية أكثر وضوحًا وسهولة.`;
    download.innerHTML = "تحميل مجاني";
    pages.innerHTML = "الصفحات";
    faq.innerHTML = "الأسئلة المتكررة";
    fonts.innerHTML = "الخطوط";
    changelog.innerHTML = "التغييرات";

    faq.href += langAr;
    fonts.href += langAr;
    changelog.href += langAr;

    textElements.forEach((element: HTMLElement) => {
        element.style.fontFamily = arFont;
        element.style.lineHeight = "1.3em";
    })
}

function fa() {
    document.documentElement.lang = "fa";

    shortBlurb.innerHTML = `"وضوح" یک پسوند ساده مرورگر است که خواندن متن عربی را واضح تر و آسان تر می کند.`;
    download.innerHTML = "دانلود رایگان";
    pages.innerHTML = "صفحات";
    faq.innerHTML = "سوالات مکرر";
    fonts.innerHTML = "فونت های";
    changelog.innerHTML = "تغییرات";

    faq.href += langFa;
    fonts.href += langFa;
    changelog.href += langFa;

    textElements.forEach((element: HTMLElement) => {
        element.style.fontFamily = faFont;
        element.style.lineHeight = "1.3em";
    })
}

switch (lang) {
    case "ar": {
        ar();
        break;
    }
    case "fa": {
        fa();
        break;
    }
    default : {
        en();
        break;
    }
}