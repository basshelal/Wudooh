///<reference path="../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/jquery/misc.d.ts"/>
///<reference path="pages/res/common.ts"/>
function get(elementId) {
    return document.getElementById(elementId);
}
var shortBlurb = get("shortBlurb");
var download = get("download");
var comingSoon = get("comingSoon");
var pages = get("pages");
var faq = get("faq");
var fonts = get("fonts");
var changelog = get("changelog");
var totalUsers = get("totalUsers");
var textElements = [shortBlurb, download, comingSoon, pages, faq, fonts, changelog, totalUsers];
var anchorElements = [faq, fonts, changelog];
var elementTranslations = [
    translation(shortBlurb, [
        {
            lang: en, translation: "Wudooh <a href=\"https://en.wiktionary.org/wiki/%D9%88%D8%B6%D9%88%D8%AD\" style=\"margin: 0\" target=\"_blank\"\n        title=\"\u0648\u0636\u0648\u062D Wiktionary\">(clarity in Arabic and Persian)</a> is a simple browser extension that makes reading Arabic script text clearer and more pleasant."
        },
        {
            lang: ar,
            translation: "\"\u0648\u0636\u0648\u062D\" \u0625\u0636\u0627\u0641\u0629 \u0628\u0633\u064A\u0637\u0629 \u0644\u0645\u062A\u0635\u0641\u062D \u0627\u0644\u0623\u0646\u062A\u0631\u0646\u062A \u062A\u062C\u0639\u0644 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u062D\u0631\u0648\u0641 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0623\u0643\u062B\u0631 \u0648\u0636\u0648\u062D\u0627\u064B \u0648\u0633\u0647\u0648\u0644\u0629."
        },
        {
            lang: fa,
            translation: "\"\u0648\u0636\u0648\u062D\" \u06CC\u06A9 \u067E\u0633\u0648\u0646\u062F \u0633\u0627\u062F\u0647 \u0645\u0631\u0648\u0631\u06AF\u0631 \u0627\u0633\u062A \u06A9\u0647 \u062E\u0648\u0627\u0646\u062F\u0646 \u062D\u0631\u0641\u200C\u0647\u0627 \u0639\u0631\u0628\u06CC \u0631\u0627 \u0648\u0627\u0636\u062D \u062A\u0631 \u0648 \u0622\u0633\u0627\u0646 \u062A\u0631 \u0645\u06CC \u06A9\u0646\u062F."
        },
    ]),
    translation(download, [
        { lang: en, translation: "Free Download" },
        { lang: ar, translation: "\u062A\u062D\u0645\u064A\u0644 \u0645\u062C\u0627\u0646\u064A" },
        { lang: fa, translation: "\u062F\u0627\u0646\u0644\u0648\u062F \u0631\u0627\u06CC\u06AF\u0627\u0646" }
    ]),
    translation(comingSoon, [
        { lang: en, translation: "Coming soon" },
        { lang: ar, translation: "\u0642\u0631\u064A\u0628\u0627\u064B \u0639\u0644\u0649" },
        { lang: fa, translation: "\u0628\u0647 \u0632\u0648\u062F\u06CC" }
    ]),
    translation(pages, [
        { lang: en, translation: "Pages" },
        { lang: ar, translation: "\u0627\u0644\u0635\u0641\u062D\u0627\u062A" },
        { lang: fa, translation: "\u0635\u0641\u062D\u0627\u062A" }
    ]),
    translation(faq, [
        { lang: en, translation: "Frequently Asked Questions" },
        { lang: ar, translation: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629" },
        { lang: fa, translation: "\u0633\u0648\u0627\u0644\u0627\u062A \u0645\u06A9\u0631\u0631" }
    ]),
    translation(fonts, [
        { lang: en, translation: "Fonts" },
        { lang: ar, translation: "\u0627\u0644\u062E\u0637\u0648\u0637" },
        { lang: fa, translation: "\u0641\u0648\u0646\u062A\u200C\u0647\u0627\u06CC" }
    ]),
    translation(changelog, [
        { lang: en, translation: "Changelog" },
        { lang: ar, translation: "\u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A" },
        { lang: fa, translation: "\u062A\u063A\u06CC\u06CC\u0631\u0627\u062A" }
    ]),
    translation(totalUsers, [
        { lang: en, translation: "Total Users" },
        { lang: ar, translation: "\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646" },
        { lang: fa, translation: "\u0645\u062C\u0645\u0648\u0639 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646" }
    ])
];
function i18n() {
    document.documentElement.lang = lang;
    if (isArScript)
        document.dir = "rtl";
    else
        document.dir = "ltr";
    elementTranslations.forEach(function (it) {
        it.element.innerHTML = it.translations.get(lang);
    });
    anchorElements.forEach(function (it) { return it.href += langQueryParamPrefix + lang; });
}
function specifics() {
    // Language specific actions
    switch (lang) {
        case ar: {
            textElements.forEach(function (element) {
                element.style.fontFamily = arFont;
                element.style.lineHeight = "1.3em";
            });
            break;
        }
        case fa: {
            textElements.forEach(function (element) {
                element.style.fontFamily = faFont;
                element.style.lineHeight = "1.3em";
            });
            break;
        }
        default: {
            break;
        }
    }
}
function displayTotalUsers() {
    $.getJSON("https://api.allorigins.win/get?url=" + encodeURIComponent("https://chrome.google.com/webstore/detail/wudooh/nigfaloeeeakmmgndbdcijjegolpjfhn")).then(function (response) {
        var chromeUsers = parseInt(("" + response.contents.match(/<span class="e-f-ih" title="([\d]*?) users">([\d]*?) users<\/span>/)).split(",")[2]);
        $.getJSON("https://api.allorigins.win/get?url=" + encodeURIComponent("https://addons.mozilla.org/en-US/firefox/addon/wudooh/")).then(function (response) {
            var firefoxUsers = parseInt(("" + response.contents.match(/<dd class="MetadataCard-content">([\d]*?)<\/dd>/)).match(/\d+/g)[0]);
            var totalUsers = chromeUsers + firefoxUsers;
            var text;
            if (isNaN(totalUsers))
                text = "Error";
            else
                text = totalUsers.toString();
            get("numUsers").innerHTML = text;
        });
    });
}
i18n();
specifics();
displayTotalUsers();
