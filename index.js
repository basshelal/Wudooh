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
const indexElements = [].concat(textElements).concat(anchorElements);
const translator = new Translator(lang, langs);
async function index() {
    document.documentElement.lang = lang;
    if (isArScript)
        document.dir = "rtl";
    else
        document.dir = "ltr";
    await translator.initialize();
    indexElements.forEach((element) => {
        element.innerHTML = translator.get(element.id);
    });
    anchorElements.forEach((it) => it.href += langQueryParam);
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
        const chromeUsers = parseInt(("" + response.contents.match(/<span class="e-f-ih" title="([\d]*?) users">([\d]*?) users<\/span>/)).split(",")[2]);
        $.getJSON(`https://api.allorigins.win/get?url=${encodeURIComponent("https://addons.mozilla.org/en-US/firefox/addon/wudooh/")}`).then(response => {
            const firefoxUsers = parseInt(("" + response.contents.match(/<dd class="MetadataCard-content">([\d]*?)<\/dd>/)).match(/\d+/g)[0]);
            const totalUsers = chromeUsers + firefoxUsers;
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
index();
specifics();
displayTotalUsers();
