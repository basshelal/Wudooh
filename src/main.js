const arabicRegex = new RegExp("([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\]+([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\\W\\d]+)*)", "g");
const arabicNumbersRegex = new RegExp("([\u0660-\u0669\u06F0-\u06F9]+)", "g");
const htmlEditables = ["textarea", "input", "text", "email", "number", "search", "tel", "url", "password"];
let observer;
function hasNodeBeenUpdated(node) {
    return node.parentElement && node.parentElement.getAttribute("wudooh") === "true";
}
function hasDocumentBeenUpdated() {
    return document.getElementById("wudoohMetaElement") !== null;
}
function hasArabicScript(node) {
    return !!node.nodeValue && !!(node.nodeValue.match(arabicRegex));
}
function isNodeEditable(node) {
    const element = node;
    const nodeName = element.nodeName.toLowerCase();
    return (element.isContentEditable || (element.nodeType === Node.ELEMENT_NODE && htmlEditables.contains(nodeName)));
}
function remapNumber(numberCharacter) {
    const char = numberCharacter.charAt(0);
    if (char === "٠" || char === "۰")
        return "0";
    if (char === "١" || char === "۱")
        return "1";
    if (char === "٢" || char === "۲")
        return "2";
    if (char === "٣" || char === "۳")
        return "3";
    if (char === "٤" || char === "۴")
        return "4";
    if (char === "٥" || char === "۵")
        return "5";
    if (char === "٦" || char === "۶")
        return "6";
    if (char === "٧" || char === "۷")
        return "7";
    if (char === "٨" || char === "۸")
        return "8";
    if (char === "٩" || char === "۹")
        return "9";
}
function getArabicTextNodesIn(rootNode) {
    let treeWalker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);
    let arabicTextNodes = [];
    let node = treeWalker.nextNode();
    while (!!node) {
        if (hasArabicScript(node))
            arabicTextNodes.push(node);
        node = treeWalker.nextNode();
    }
    return arabicTextNodes;
}
async function updateNode(node, textSize, lineHeight, font) {
    let newSize = textSize / 100;
    let newHeight = lineHeight / 100;
    if (!!node.nodeValue) {
        if (hasNodeBeenUpdated(node))
            updateByChanging(node, newSize, newHeight, font);
        else if (!hasNodeBeenUpdated(node))
            updateByAdding(node, newSize, newHeight, font);
    }
}
async function updateByAdding(node, textSize, lineHeight, font) {
    const parent = node.parentNode;
    if (!parent || !node)
        return;
    if (isNodeEditable(parent) || isNodeEditable(node))
        return;
    let newHTML;
    if (font === "Original") {
        newHTML = "<span wudooh='true' style='" +
            "font-size:" + textSize + "em;" +
            "line-height:" + lineHeight + "em;" +
            "'>$&</span>";
    }
    else {
        newHTML = "<span wudooh='true' style='" +
            "font-size:" + textSize + "em;" +
            "line-height:" + lineHeight + "em;" +
            "font-family:" + "\"" + font + "\";" +
            "'>$&</span>";
    }
    let text = node.nodeValue.replace(arabicRegex, newHTML);
    let nextSibling = node.nextSibling;
    let newElement = document.createElement("div");
    newElement.innerHTML = text;
    while (newElement.firstChild) {
        parent.insertBefore(newElement.firstChild, nextSibling);
    }
    parent.removeChild(node);
}
async function updateByChanging(node, textSize, lineHeight, font) {
    node.parentElement.style.fontSize = textSize + "em";
    node.parentElement.style.lineHeight = lineHeight + "em";
    if (font === "Original")
        node.parentElement.style.fontFamily = "";
    else
        node.parentElement.style.fontFamily = font;
}
async function updateAll(textSize, lineHeight, font) {
    getArabicTextNodesIn(document.body).forEach((it) => updateNode(it, textSize, lineHeight, font));
}
async function startObserver(textSize, lineHeight, font) {
    if (!!observer) {
        observer.disconnect();
        observer = null;
    }
    if (!observer) {
        const config = {
            attributes: false,
            attributeOldValue: false,
            characterData: true,
            characterDataOldValue: true,
            childList: true,
            subtree: true,
        };
        const callback = (mutationsList) => {
            mutationsList.forEach((record) => {
                if (record.addedNodes.length > 0) {
                    record.addedNodes.forEach((addedNode) => {
                        getArabicTextNodesIn(addedNode).forEach((arabicNode) => {
                            updateNode(arabicNode, textSize, lineHeight, font);
                        });
                    });
                }
                if (record.target.nodeValue !== record.oldValue && record.target.parentNode instanceof Node) {
                    getArabicTextNodesIn(record.target.parentNode).forEach((arabicNode) => {
                        updateNode(arabicNode, textSize, lineHeight, font);
                    });
                }
            });
        };
        observer = new MutationObserver(callback);
        observer.observe(document.body, config);
    }
}
async function notifyDocument() {
    if (!hasDocumentBeenUpdated()) {
        let meta = document.createElement("meta");
        meta.id = "wudoohMetaElement";
        meta.setAttribute("wudooh", "true");
        document.head.appendChild(meta);
    }
}
async function toggleOff() {
    if (!!observer) {
        observer.disconnect();
        observer = null;
    }
    getArabicTextNodesIn(document.body).forEach((node) => {
        node.parentElement.style.fontSize = null;
        node.parentElement.style.lineHeight = null;
        node.parentElement.style.fontFamily = null;
    });
}
async function addMessageListener() {
    runtime.onMessage.addListener((message) => {
        if (message.reason == null)
            return;
        if (message.reason === reasonUpdateAllText) {
            main();
        }
        if (message.reason === reasonInjectCustomFonts) {
            injectCustomFonts(message.customFonts);
        }
        if (message.reason === reasonToggleOff) {
            toggleOff();
        }
    });
}
async function main() {
    const storage = await sync.get(keys);
    let textSize = storage.textSize;
    let lineHeight = storage.lineHeight;
    let font = storage.font;
    const isOn = storage.onOff;
    const whitelisted = storage.whitelisted;
    const customSettings = storage.customSettings;
    const customFonts = storage.customFonts;
    const thisURL = new URL(document.URL).hostname;
    const isWhitelisted = !!whitelisted.find((it) => it === thisURL);
    const customSite = customSettings.find((custom) => custom.url === thisURL);
    if (isOn && !isWhitelisted) {
        injectCustomFonts(customFonts);
        if (customSite) {
            textSize = customSite.textSize;
            lineHeight = customSite.lineHeight;
            font = customSite.font;
        }
        updateAll(textSize, lineHeight, font);
        document.addEventListener("DOMContentLoaded", () => wait(1000, () => updateAll(textSize, lineHeight, font)));
        wait(1000, () => updateAll(textSize, lineHeight, font));
        startObserver(textSize, lineHeight, font);
        notifyDocument();
    }
    if (hasDocumentBeenUpdated() && isWhitelisted) {
        toggleOff();
    }
}
main();
addMessageListener();
