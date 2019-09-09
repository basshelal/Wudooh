const urlParams: URLSearchParams = new URLSearchParams(window.location.search);

const lang: string = urlParams.get("lang") || "en";

function get<T extends HTMLElement>(elementId: string): T | null {
    return document.getElementById(elementId) as T
}

const arabicFont: string = "Droid Arabic Naskh";
const farsiFont: string = "Droid Arabic Naskh";

const shortBlurb = get<HTMLHeadingElement>("shortBlurb");
const download = get<HTMLHeadingElement>("download");

const fontsLink = get<HTMLAnchorElement>("fontsLink");

function en() {
    document.dir = "ltr";
    shortBlurb.innerHTML =
        `Wudooh <a href=\"https://en.wiktionary.org/wiki/%D9%88%D8%B6%D9%88%D8%AD\" style=\"margin: 0\" target=\"_blank\"> 
        (clarity in Arabic and Persian)</a>
        is a simple browser extension that makes reading Arabic script text clearer and more pleasant.`;
    download.innerHTML = "Download for free";

    fontsLink.href = "pages/fonts.html?lang=en";
}

function ar() {
    document.dir = "rtl";
    shortBlurb.innerHTML = `"وضوح" إضافة بسيطة لمتصفح الأنترنت يجعل قراءة الحروف العربية أكثر وضوحًا وسهولة.`;
    shortBlurb.style.fontFamily = arabicFont;

    download.innerHTML = "تحميل مجاني";
    download.style.fontFamily = arabicFont;

    fontsLink.href = "pages/fonts.html?lang=ar";
}

function fa() {
    document.dir = "rtl";
    shortBlurb.innerHTML = `"وضوح" یک پسوند ساده مرورگر است که خواندن متن عربی را واضح تر و آسان تر می کند.`;
    shortBlurb.style.fontFamily = farsiFont;

    download.innerHTML = "دانلود رایگان";
    download.style.fontFamily = farsiFont;

    fontsLink.href = "pages/fonts.html?lang=fa";
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