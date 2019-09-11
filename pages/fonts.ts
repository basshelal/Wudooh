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

const bannerImageAnchor = get<HTMLAnchorElement>("bannerImageAnchor");

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
    default : {
        en();
        break;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    setTimeout(function () {
        let wudooh = false;
        const metas = document.head.getElementsByTagName("meta");

        for (let i = 0; i < metas.length; i++) {
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
            })
        }
    }, 1000);
});
