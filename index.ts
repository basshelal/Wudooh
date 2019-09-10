const urlParams: URLSearchParams = new URLSearchParams(window.location.search);

const lang: string = urlParams.get("lang") || "en";

function get<T extends HTMLElement>(elementId: string): T | null {
    return document.getElementById(elementId) as T
}

const arabicFont: string = "Droid Arabic Naskh";
const farsiFont: string = "Droid Arabic Naskh";

// Text Elements
const shortBlurb = get<HTMLHeadingElement>("shortBlurb");
const download = get<HTMLHeadingElement>("download");
const pages = get<HTMLHeadingElement>("pages");
const faq = get<HTMLAnchorElement>("faq");
const fonts = get<HTMLAnchorElement>("fonts");
const changelog = get<HTMLAnchorElement>("changelog");
const textElements: Array<HTMLElement> = [shortBlurb, download, pages, faq, fonts, changelog];

const langEn: string = "?lang=en";
const langAr: string = "?lang=ar";
const langFa: string = "?lang=fa";

function en() {
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
    document.dir = "rtl";
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
        element.style.fontFamily = arabicFont;
        element.style.lineHeight = "1.3em";
    })
}

function fa() {
    document.dir = "rtl";

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
        element.style.fontFamily = farsiFont;
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