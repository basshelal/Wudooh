///<reference path="../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/jquery/misc.d.ts"/>
///<reference path="pages/res/common.ts"/>

const anchorElements: Array<HTMLAnchorElement> = [
    get("features"),
    get("faq"),
    get("changelog"),
    get("guides"),
    get("fonts"),
]
const textElements: Array<HTMLElement> = anchorElements.concat([
    get("shortBlurb"),
    get("download"),
    get("pages"),
    get("totalUsers"),
])

const translator = new Translator(lang, langs)

async function index() {
    document.documentElement.lang = lang
    if (isArScript) document.dir = "rtl"
    else document.dir = "ltr"

    await translator.initialize()

    textElements.forEach((element: HTMLElement) => {
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

async function displayTotalUsers() {
    const chromeResponse = await (await fetch(`https://api.allorigins.win/get?url=${
            encodeURIComponent("https://chrome.google.com/webstore/detail/wudooh/nigfaloeeeakmmgndbdcijjegolpjfhn")}`)
    ).json()

    const chromeUsers: number = parseInt(
        ("" + chromeResponse.contents.match(/<span class="e-f-ih" title="([\d]*?) users">([\d]*?) users<\/span>/)).split(",")[2]
    )

    const firefoxResponse = await (await fetch(`https://api.allorigins.win/get?url=${
            encodeURIComponent("https://addons.mozilla.org/en-US/firefox/addon/wudooh/")}`)
    ).json()

    const firefoxUsers = parseInt(
        ("" + firefoxResponse.contents.match(/<dd class="MetadataCard-content">([\d]*?)<\/dd>/)).match(/\d+/g)[0]
    )
    const totalUsers = chromeUsers + firefoxUsers
    let text: string = "..."
    if (isNaN(totalUsers)) displayTotalUsers()
    else text = totalUsers.toString()
    get("numUsers").innerHTML = text
}

specifics()
index()
displayTotalUsers()
