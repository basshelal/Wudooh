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
var bannerImageAnchor = get("bannerImageAnchor");

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
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        var wudooh = false;
        var metas = document.head.getElementsByTagName("meta");
        for (var i = 0; i < metas.length; i++) {
            if (metas.item(i).getAttribute("wudooh") === "true") {
                wudooh = true;
                break;
            }
        }
        if (wudooh) {
            // @ts-ignore
            document.querySelector('#snackbar').MaterialSnackbar.showSnackbar({
                message: "Wudooh extension is on, fonts will not show correctly, please turn it off and reload the page",
                timeout: 9999999999,
                actionText: "Reload",
                actionHandler: function () {
                    document.location.reload();
                }
            });
        }
    }, 1000);
});
