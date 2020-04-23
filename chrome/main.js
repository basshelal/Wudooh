/**
 * This is the main script that reads the document and updates any Arabic script text
 */
///<reference path="../../../.WebStorm2019.3/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>
/**
 * This Arabic regex allows and accepts any non Arabic symbols next to Arabic symbols,
 * this means that it accepts anything as long as it has some Arabic symbol in it
 */
const arabicRegex = new RegExp("([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\]+([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\\W\\d]+)*)", "g");
const arabicNumbersRegex = new RegExp("([\u0660-\u0669\u06F0-\u06F9]+)", "g");
/** The observer used in {@linkcode startObserver} to dynamically update any newly added Nodes */
let observer;
/**
 * Returns true if the passed in Node has been updated by Wudooh and false otherwise
 */
function hasNodeBeenUpdated(node) {
    return node.parentElement && node.parentElement.getAttribute("wudooh") === "true";
}
/**
 * Returns true if this document has already been updated by Wudooh before,
 * this is done in {@linkcode notifyDocument()}
 */
function hasDocumentBeenUpdated() {
    return document.getElementById("wudoohMetaElement") !== null;
}
/**
 * Returns whether the given node has any Arabic script or not, this is any script that matches arabicRegEx.
 * True if it does and false otherwise
 */
function hasArabicScript(node) {
    return !!node.nodeValue && !!(node.nodeValue.match(arabicRegex));
}
/**
 * Checks whether the passed in node is editable or not.
 * An editable node is one that returns true to isContentEditable or has a tag name as
 * any one of the following:
 * "textarea", "input", "text", "email", "number", "search", "tel", "url", "password"
 *
 * @param node the node to check
 * @return true if the node is editable and false otherwise
 */
function isNodeEditable(node) {
    let element = node;
    let nodeName = element.nodeName.toLowerCase();
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
/**
 * Gets all nodes within the passed in node that have any Arabic text
 * @param rootNode the node to use as the root of the traversal
 * @return an array of nodes that contain all the nodes with Arabic text that are children of the passed in
 * root node
 */
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
/**
 * Updates the passed in node's html to have the properties of a modified Arabic text node, this will
 * replace any text that matches arabicRegEx to be a span with the font size and line height specified by
 * the user's options, the span will have a class='ar', this can be used to check if the text has been
 * updated by this function or not
 * @param node the node to update
 * @param textSize the size to update the text to
 * @param lineHeight the height to update the line to
 * @param font the name of the font to update the text to
 */
function updateNode(node, textSize, lineHeight, font = defaultFont) {
    let newSize = textSize / 100;
    let newHeight = lineHeight / 100;
    if (!!node.nodeValue) {
        if (hasNodeBeenUpdated(node))
            updateByChanging(node, newSize, newHeight, font);
        else if (!hasNodeBeenUpdated(node))
            updateByAdding(node, newSize, newHeight, font);
    }
}
function updateByAdding(node, textSize, lineHeight, font) {
    const parent = node.parentNode;
    // return if parent or node are null
    if (!parent || !node)
        return;
    // don't do anything if this node or its parent are editable
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
    // the div is temporary and doesn't show up in the html
    let newElement = document.createElement("div");
    newElement.innerHTML = text;
    while (newElement.firstChild) {
        // we only insert the passed in html, the div is not inserted
        parent.insertBefore(newElement.firstChild, nextSibling);
    }
    parent.removeChild(node);
}
function updateByChanging(node, textSize, lineHeight, font) {
    node.parentElement.style.fontSize = textSize + "em";
    node.parentElement.style.lineHeight = lineHeight + "em";
    if (font === "Original")
        node.parentElement.style.fontFamily = "";
    else
        node.parentElement.style.fontFamily = font;
}
/**
 * Updates all Arabic script nodes in this document's body by calling updateNode() on each node in this document
 * with Arabic script
 * @param textSize the size to update the text to
 * @param lineHeight the height to update the line to
 * @param font the name of the font to update the text to
 */
function updateAll(textSize, lineHeight, font = defaultFont) {
    getArabicTextNodesIn(document.body).forEach((it) => updateNode(it, textSize, lineHeight, font));
}
/**
 * Starts the observer that will observe for any additions to the document and update them if they have any
 * Arabic text and they have not been updated yet
 * @param textSize the size to update the text to
 * @param lineHeight the height to update the line to
 * @param font the name of the font to update the text to
 */
function startObserver(textSize, lineHeight, font = defaultFont) {
    // If observer was existing then disconnect it and delete it
    if (!!observer) {
        observer.disconnect();
        observer = null;
    }
    // Only do anything if observer is null
    if (!observer) {
        let config = {
            attributes: false,
            attributeOldValue: false,
            characterData: true,
            characterDataOldValue: true,
            childList: true,
            subtree: true,
        };
        let callback = (mutationsList) => {
            mutationsList.forEach((record) => {
                // If something has been added
                if (record.addedNodes.length > 0) {
                    //  For each added node
                    record.addedNodes.forEach((addedNode) => {
                        // For each node with Arabic script in addedNode
                        getArabicTextNodesIn(addedNode).forEach((arabicNode) => {
                            updateNode(arabicNode, textSize, lineHeight, font);
                        });
                    });
                }
                // If the value has changed
                if (record.target.nodeValue !== record.oldValue && record.target.parentNode instanceof Node) {
                    // If the node now has Arabic text when it didn't, this is rare and only occurs on YouTube
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
/**
 * Notify the current document that Wudooh has been executed on it.
 * This has no use currently but may be useful later for sites to know if Wudooh is changing their content and for
 * testing
 */
function notifyDocument() {
    if (!hasDocumentBeenUpdated()) {
        let meta = document.createElement("meta");
        meta.id = "wudoohMetaElement";
        meta.setAttribute("wudooh", "true");
        document.head.appendChild(meta);
    }
}
/**
 * Injects the passed in {@linkcode CustomFont}s into this document's head into a new style element
 * @param customFonts the Array of CustomFonts to inject into this document
 */
function injectCustomFonts(customFonts) {
    let customFontsStyle = get("wudoohCustomFontsStyle");
    if (customFontsStyle) {
        customFontsStyle.innerHTML = "";
        document.head.removeChild(customFontsStyle);
        customFontsStyle = null;
    }
    customFontsStyle = document.createElement("style");
    customFontsStyle.id = "wudoohCustomFontsStyle";
    customFonts.forEach((customFont) => {
        const fontName = customFont.fontName;
        const fontUrl = customFont.url;
        let injectedCss = `@font-face { font-family: '${fontName}'; src: local('${fontName}')`;
        if (fontUrl)
            injectedCss = injectedCss.concat(`, url('${fontUrl}')`);
        injectedCss = injectedCss.concat(`; }\n`);
        customFontsStyle.innerHTML = customFontsStyle.innerHTML.concat(injectedCss);
    });
    document.head.append(customFontsStyle);
}
function toggleOff() {
    observer.disconnect();
    observer = null;
    getArabicTextNodesIn(document.body).forEach((node) => {
        node.parentElement.style.fontSize = null;
        node.parentElement.style.lineHeight = null;
        node.parentElement.style.fontFamily = null;
    });
}
/**
 * Listener to update text if options are modified, the options being text size, line height and font
 * Since the original font is not saved, reverting the text to it's original form is not possible
 * This will disconnect the previous observer and start a new one its place with the new options
 * The check whether the switch is on or if this site is whitelisted is not done here but at the
 * sender's sendMessage call
 */
function addMessageListener() {
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
/**
 * Main execution:
 * Updates all existing text according to the options
 * Then starts an observer with those same options to update any new text that will come
 * This only happens if the on off switch is on and the site is not whitelisted
 */
function main() {
    sync.get(keys).then((storage) => {
        let textSize = storage.textSize;
        let lineHeight = storage.lineHeight;
        let isOn = storage.onOff;
        let font = storage.font;
        let whitelisted = storage.whitelisted;
        let customSettings = storage.customSettings;
        let customFonts = storage.customFonts;
        let thisHostname = new URL(document.URL).hostname;
        let isWhitelisted = !!whitelisted.find((it) => it === thisHostname);
        let customSite = customSettings.find((custom) => custom.url === thisHostname);
        // Only do anything if the switch is on and this site is not whitelisted
        if (isOn && !isWhitelisted) {
            injectCustomFonts(customFonts);
            // If it's a custom site then change the textSize, lineHeight and font
            if (customSite) {
                textSize = customSite.textSize;
                lineHeight = customSite.lineHeight;
                font = customSite.font;
            }
            updateAll(textSize, lineHeight, font);
            startObserver(textSize, lineHeight, font);
            notifyDocument();
        }
        // We've been updated and now we've become whitelisted
        if (hasDocumentBeenUpdated() && isWhitelisted) {
            toggleOff();
        }
    });
}
main();
addMessageListener();
