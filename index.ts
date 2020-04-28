///<reference path="../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/jquery/misc.d.ts"/>
///<reference path="pages/res/common.ts"/>

const shortBlurb = get<HTMLHeadingElement>("shortBlurb")
const download = get<HTMLHeadingElement>("download")
const comingSoon = get<HTMLHeadingElement>("comingSoon")
const pages = get<HTMLHeadingElement>("pages")
const faq = get<HTMLAnchorElement>("faq")
const fonts = get<HTMLAnchorElement>("fonts")
const changelog = get<HTMLAnchorElement>("changelog")
const totalUsers = get<HTMLHeadingElement>("totalUsers")
const textElements: Array<HTMLElement> = [shortBlurb, download, comingSoon, pages, faq, fonts, changelog, totalUsers]
const anchorElements: Array<HTMLAnchorElement> = [faq, fonts, changelog]
const indexElements: Array<HTMLElement> = [].concat(textElements).concat(anchorElements)

const translator = new Translator(lang, langs)

async function index() {
    document.documentElement.lang = lang
    if (isArScript) document.dir = "rtl"
    else document.dir = "ltr"

    await translator.initialize()

    indexElements.forEach((element: HTMLElement) => {
        element.innerHTML = translator.get(element.id)
    })
    anchorElements.forEach((it: HTMLAnchorElement) => it.href += langQueryParam)
}

function specifics() {
// Language specific actions
    switch (lang) {
        case ar: {
            textElements.forEach((element: HTMLElement) => {
                element.style.fontFamily = arFont
                element.style.lineHeight = "1.3em"
            })
            break
        }
        case fa: {
            textElements.forEach((element: HTMLElement) => {
                element.style.fontFamily = faFont
                element.style.lineHeight = "1.3em"
            })
            break
        }
        default : {
            break
        }
    }
}

function displayTotalUsers() {
    $.getJSON(`https://api.allorigins.win/get?url=${encodeURIComponent(
        "https://chrome.google.com/webstore/detail/wudooh/nigfaloeeeakmmgndbdcijjegolpjfhn")}`
    ).then(response => {
        const chromeUsers: number = parseInt(
            ("" + response.contents.match(/<span class="e-f-ih" title="([\d]*?) users">([\d]*?) users<\/span>/)).split(",")[2]
        )
        $.getJSON(`https://api.allorigins.win/get?url=${encodeURIComponent(
            "https://addons.mozilla.org/en-US/firefox/addon/wudooh/")}`
        ).then(response => {
            const firefoxUsers = parseInt(
                ("" + response.contents.match(/<dd class="MetadataCard-content">([\d]*?)<\/dd>/)).match(/\d+/g)[0]
            )

            const totalUsers = chromeUsers + firefoxUsers
            let text: string = "..."
            if (isNaN(totalUsers)) {
                displayTotalUsers()
            } else text = totalUsers.toString()
            get("numUsers").innerHTML = text
        })
    })
}

index()
specifics()
displayTotalUsers()
