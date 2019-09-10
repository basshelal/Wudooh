const urlParams: URLSearchParams = new URLSearchParams(window.location.search);

const lang: string = urlParams.get("lang") || "en";

function get<T extends HTMLElement>(elementId: string): T | null {
    return document.getElementById(elementId) as T
}

const arabicFont: string = "Droid Arabic Naskh";
const farsiFont: string = "Droid Arabic Naskh";

const langEn: string = "?lang=en";
const langAr: string = "?lang=ar";
const langFa: string = "?lang=fa";

function en() {
    document.dir = "ltr";
}

function ar() {
    document.dir = "rtl";
}

function fa() {
    document.dir = "rtl";
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