var urlParams = new URLSearchParams(window.location.search);
var lang = urlParams.get("lang") || "en";
function $(elementId) {
    return document.getElementById(elementId);
}
function en() {
    document.dir = "ltr";
    $("shortBlurb").innerHTML =
        "Wudooh <a href=\"https://en.wiktionary.org/wiki/%D9%88%D8%B6%D9%88%D8%AD\" style=\"margin: 0\" target=\"_blank\"> \n        (clarity in Arabic and Persian)</a>\n        is a simple browser extension that makes reading Arabic script text clearer and more pleasant.";
}
function ar() {
    document.dir = "rtl";
    $("shortBlurb").innerHTML = "\"\u0648\u0636\u0648\u062D\" \u0625\u0636\u0627\u0641\u0629 \u0628\u0633\u064A\u0637\u0629 \u0644\u0645\u062A\u0635\u0641\u062D \u0627\u0644\u0623\u0646\u062A\u0631\u0646\u062A \u064A\u062C\u0639\u0644 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u062D\u0631\u0648\u0641 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0623\u0643\u062B\u0631 \u0648\u0636\u0648\u062D\u064B\u0627 \u0648\u0633\u0647\u0648\u0644\u0629.";
}
function fa() {
    document.dir = "rtl";
    $("shortBlurb").innerHTML = "\"\u0648\u0636\u0648\u062D\" \u06CC\u06A9 \u067E\u0633\u0648\u0646\u062F \u0633\u0627\u062F\u0647 \u0645\u0631\u0648\u0631\u06AF\u0631 \u0627\u0633\u062A \u06A9\u0647 \u062E\u0648\u0627\u0646\u062F\u0646 \u0645\u062A\u0646 \u0639\u0631\u0628\u06CC \u0631\u0627 \u0648\u0627\u0636\u062D \u062A\u0631 \u0648 \u0622\u0633\u0627\u0646 \u062A\u0631 \u0645\u06CC \u06A9\u0646\u062F.";
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
