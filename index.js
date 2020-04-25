function get(elementId) {
    return document.getElementById(elementId);
}
const shortBlurb = get("shortBlurb");
const download = get("download");
const comingSoon = get("comingSoon");
const pages = get("pages");
const faq = get("faq");
const fonts = get("fonts");
const changelog = get("changelog");
const totalUsers = get("totalUsers");
const textElements = [shortBlurb, download, comingSoon, pages, faq, fonts, changelog, totalUsers];
const anchorElements = [faq, fonts, changelog];
const elementTranslations = [
    translation(shortBlurb, [
        {
            lang: en, translation: `Wudooh <a href=\"https://en.wiktionary.org/wiki/%D9%88%D8%B6%D9%88%D8%AD\" style=\"margin: 0\" target=\"_blank\"
        title="وضوح Wiktionary">(clarity in Arabic and Persian)</a> is a simple browser extension that makes reading Arabic script text clearer and more pleasant.`
        },
        {
            lang: ar,
            translation: `"وضوح" إضافة بسيطة لمتصفح الأنترنت تجعل قراءة الحروف العربية أكثر وضوحاً وسهولة.`
        },
        {
            lang: fa,
            translation: `"وضوح" یک پسوند ساده مرورگر است که خواندن حرف‌ها عربی را واضح تر و آسان تر می کند.`
        },
    ]),
    translation(download, [
        { lang: en, translation: `Free Download` },
        { lang: ar, translation: `تحميل مجاني` },
        { lang: fa, translation: `دانلود رایگان` }
    ]),
    translation(comingSoon, [
        { lang: en, translation: `Coming soon` },
        { lang: ar, translation: `قريباً على` },
        { lang: fa, translation: `به زودی` }
    ]),
    translation(pages, [
        { lang: en, translation: `Pages` },
        { lang: ar, translation: `الصفحات` },
        { lang: fa, translation: `صفحات` }
    ]),
    translation(faq, [
        { lang: en, translation: `Frequently Asked Questions` },
        { lang: ar, translation: `الأسئلة المتكررة` },
        { lang: fa, translation: `سوالات مکرر` }
    ]),
    translation(fonts, [
        { lang: en, translation: `Fonts` },
        { lang: ar, translation: `الخطوط` },
        { lang: fa, translation: `فونت‌های` }
    ]),
    translation(changelog, [
        { lang: en, translation: `Changelog` },
        { lang: ar, translation: `التغييرات` },
        { lang: fa, translation: `تغییرات` }
    ]),
    translation(totalUsers, [
        { lang: en, translation: `Total Users` },
        { lang: ar, translation: `مجموع المستخدمين` },
        { lang: fa, translation: `مجموع کاربران` }
    ])
];
function i18n() {
    document.documentElement.lang = lang;
    if (isArScript)
        document.dir = "rtl";
    else
        document.dir = "ltr";
    elementTranslations.forEach((it) => {
        it.element.innerHTML = it.translations.get(lang);
    });
    anchorElements.forEach((it) => it.href += langQueryParamPrefix + lang);
}
function specifics() {
    switch (lang) {
        case ar: {
            textElements.forEach((element) => {
                element.style.fontFamily = arFont;
                element.style.lineHeight = "1.3em";
            });
            break;
        }
        case fa: {
            textElements.forEach((element) => {
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
    $.getJSON(`https://api.allorigins.win/get?url=${encodeURIComponent("https://chrome.google.com/webstore/detail/wudooh/nigfaloeeeakmmgndbdcijjegolpjfhn")}`).then(response => {
        let chromeUsers = parseInt(("" + response.contents.match(/<span class="e-f-ih" title="([\d]*?) users">([\d]*?) users<\/span>/)).split(",")[2]);
        $.getJSON(`https://api.allorigins.win/get?url=${encodeURIComponent("https://addons.mozilla.org/en-US/firefox/addon/wudooh/")}`).then(response => {
            let firefoxUsers = parseInt(("" + response.contents.match(/<dd class="MetadataCard-content">([\d]*?)<\/dd>/)).match(/\d+/g)[0]);
            let totalUsers = chromeUsers + firefoxUsers;
            let text = "...";
            if (isNaN(totalUsers)) {
                displayTotalUsers();
            }
            else
                text = totalUsers.toString();
            get("numUsers").innerHTML = text;
        });
    });
}
i18n();
specifics();
displayTotalUsers();
