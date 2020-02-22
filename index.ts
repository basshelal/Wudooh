///<reference path="../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/jquery/misc.d.ts"/>
///<reference path="pages/res/common.ts"/>

function get<T extends HTMLElement>(elementId: string): T | null {
    return document.getElementById(elementId) as T
}

const shortBlurb = get<HTMLHeadingElement>("shortBlurb");
const download = get<HTMLHeadingElement>("download");
const comingSoon = get<HTMLHeadingElement>("comingSoon");
const pages = get<HTMLHeadingElement>("pages");
const faq = get<HTMLAnchorElement>("faq");
const fonts = get<HTMLAnchorElement>("fonts");
const changelog = get<HTMLAnchorElement>("changelog");
const totalUsers = get<HTMLHeadingElement>("totalUsers");
const textElements: Array<HTMLElement> = [shortBlurb, download, comingSoon, pages, faq, fonts, changelog, totalUsers];
const anchorElements: Array<HTMLAnchorElement> = [faq, fonts, changelog];

const elementTranslations: Array<ElementTranslationMapping> = [
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
        {lang: en, translation: `Free Download`},
        {lang: ar, translation: `تحميل مجاني`},
        {lang: fa, translation: `دانلود رایگان`}
    ]),
    translation(comingSoon, [
        {lang: en, translation: `Coming soon`},
        {lang: ar, translation: `قريباً على`},
        {lang: fa, translation: `به زودی`}
    ]),
    translation(pages, [
        {lang: en, translation: `Pages`},
        {lang: ar, translation: `الصفحات`},
        {lang: fa, translation: `صفحات`}
    ]),
    translation(faq, [
        {lang: en, translation: `Frequently Asked Questions`},
        {lang: ar, translation: `الأسئلة المتكررة`},
        {lang: fa, translation: `سوالات مکرر`}
    ]),
    translation(fonts, [
        {lang: en, translation: `Fonts`},
        {lang: ar, translation: `الخطوط`},
        {lang: fa, translation: `فونت‌های`}
    ]),
    translation(changelog, [
        {lang: en, translation: `Changelog`},
        {lang: ar, translation: `التغييرات`},
        {lang: fa, translation: `تغییرات`}
    ]),
    translation(totalUsers, [
        {lang: en, translation: `Total Users`},
        {lang: ar, translation: `مجموع المستخدمين`},
        {lang: fa, translation: `مجموع کاربران`}
    ])
];

function i18n() {
    document.documentElement.lang = lang;
    if (isArScript) document.dir = "rtl";
    else document.dir = "ltr";

    elementTranslations.forEach((it: ElementTranslationMapping) => {
        it.element.innerHTML = it.translations.get(lang);
    });
    anchorElements.forEach((it: HTMLAnchorElement) => it.href += langQueryParamPrefix + lang);
}

function specifics() {
// Language specific actions
    switch (lang) {
        case ar: {
            textElements.forEach((element: HTMLElement) => {
                element.style.fontFamily = arFont;
                element.style.lineHeight = "1.3em";
            });
            break;
        }
        case fa: {
            textElements.forEach((element: HTMLElement) => {
                element.style.fontFamily = faFont;
                element.style.lineHeight = "1.3em";
            });
            break;
        }
        default : {
            break;
        }
    }
}

function displayTotalUsers() {
    $.getJSON(`https://api.allorigins.win/get?url=${encodeURIComponent(
        "https://chrome.google.com/webstore/detail/wudooh/nigfaloeeeakmmgndbdcijjegolpjfhn")}`
    ).then(response => {
        let chromeUsers: number = parseInt(
            ("" + response.contents.match(/<span class="e-f-ih" title="([\d]*?) users">([\d]*?) users<\/span>/)).split(",")[2]
        );
        $.getJSON(`https://api.allorigins.win/get?url=${encodeURIComponent(
            "https://addons.mozilla.org/en-US/firefox/addon/wudooh/")}`
        ).then(response => {
            let firefoxUsers = parseInt(
                ("" + response.contents.match(/<dd class="MetadataCard-content">([\d]*?)<\/dd>/)).match(/\d+/g)[0]
            );

            let totalUsers = chromeUsers + firefoxUsers;
            let text: string = "...";
            if (isNaN(totalUsers)) {
                displayTotalUsers();
            } else text = totalUsers.toString();
            get("numUsers").innerHTML = text;
        })
    });
}

i18n();
specifics();
displayTotalUsers();
