var urlParams = new URLSearchParams(window.location.search);
var lang = urlParams.get("lang") || "en";
function get(elementId) {
    return document.getElementById(elementId);
}
var arabicFont = "Droid Arabic Naskh";
var farsiFont = "Droid Arabic Naskh";
var langEn = "?lang=en";
var langAr = "?lang=ar";
var langFa = "?lang=fa";
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
    default: {
        en();
        break;
    }
}
