const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get("lang") || "en";

function get(elementId) {
    return document.getElementById(elementId);
}

const arabicFont = "Droid Arabic Naskh";
const farsiFont = "Droid Arabic Naskh";
const langEn = "?lang=en";
const langAr = "?lang=ar";
const langFa = "?lang=fa";
const bannerImageAnchor = get("bannerImageAnchor");

function en() {
    document.dir = "ltr";
    bannerImageAnchor.href += langEn;
}

function ar() {
    document.dir = "rtl";
    bannerImageAnchor.href += langAr;
}

function fa() {
    document.dir = "rtl";
    bannerImageAnchor.href += langFa;
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
    default: {
        en();
        break;
    }
}
