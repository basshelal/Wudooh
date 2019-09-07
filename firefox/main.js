///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/firefox-webext-browser/index.d.ts"/>
/**
 * This is the main script that reads the document and updates any Arabic script text
 */
// TODO good thing to add is to allow for symbols and numbers between Arabic or at the end or beginning of it
// like hashtags # and numbers and exclamation marks etc
const arabicRegEx = new RegExp('([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF]+(' +
    ' [\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\W\d]+)*)', 'g');
let observer;
/**
 * Extension function for a contains function in an array
 * @param element the element to check whether is in this array or not
 * @return true if the element exists in this array, false otherwise
 */
Array.prototype.contains = function (element) {
    let result = false;
    for (let i = 0; i < this.length; i++) {
        if (element === this[i]) {
            result = true;
            break;
        }
    }
    return result;
};
/**
 * Returns whether the given node has any Arabic script or not, this is any script that matches arabicRegEx
 * @param node the node to check
 * @return true if the node contains any arabic script, false otherwise
 */
function hasArabicScript(node) {
    return !!(node.nodeValue && (node.nodeValue.trim() != "") && (node.nodeValue.match(arabicRegEx)));
}
/**
 * Gets all nodes within the passed in node that have any Arabic text
 * @param rootNode the node to use as the root of the traversal
 * @return an array of nodes that contain all the nodes with Arabic text that are children of the passed in
 * root node
 */
function getArabicTextNodesIn(rootNode) {
    let walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ALL);
    let node;
    let arabicTextNodes = [];
    // noinspection JSAssignmentUsedAsCondition
    while (node = walker.nextNode()) {
        if (hasArabicScript(node)) {
            arabicTextNodes.push(node);
        }
    }
    return arabicTextNodes;
}
/**
 * Sets the node's html content to the passed in html string
 * @param node the node to change the html of
 * @param html the html string that will be the passed in node's html
 */
function setNodeHtml(node, html) {
    let parent = node.parentNode;
    if (!parent || !node)
        return;
    // don't change anything if this node or its parent are editable
    if (isEditable(parent) || isEditable(node))
        return;
    let nextSibling = node.nextSibling;
    // the div is temporary and doesn't show up in the html
    let newElement = document.createElement("div");
    newElement.innerHTML = html;
    while (newElement.firstChild) {
        // we only insert the passed in html, the div is not inserted
        parent.insertBefore(newElement.firstChild, nextSibling);
    }
    parent.removeChild(node);
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
function isEditable(node) {
    let element = node;
    let nodeName = element.nodeName.toLowerCase();
    let editables = ["textarea", "input", "text", "email", "number", "search", "tel", "url", "password"];
    return (element.isContentEditable || (element.nodeType === Node.ELEMENT_NODE && editables.contains(nodeName)));
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
function updateNode(node, textSize, lineHeight, font = "Droid Arabic Naskh") {
    if (node.nodeValue) {
        let newSize = textSize / 100;
        let newHeight = lineHeight / 100;
        let newHTML;
        if (font === "Original") {
            newHTML = "<span class='ar'' style='" +
                "font-size:" + newSize + "em;" +
                "line-height:" + newHeight + "em;" +
                "'>$&</span>";
        }
        else {
            newHTML = "<span class='ar'' style='" +
                "font-size:" + newSize + "em;" +
                "line-height:" + newHeight + "em;" +
                "font-family:" + "\"" + font + "\"" + "," + "sans-serif;" +
                "'>$&</span>";
        }
        let text = node.nodeValue.replace(arabicRegEx, newHTML);
        setNodeHtml(node, text);
    }
}
/**
 * Updates all Arabic script nodes in this document's body by calling updateNode() on each node in this document
 * with Arabic script
 * @param textSize the size to update the text to
 * @param lineHeight the height to update the line to
 * @param font the name of the font to update the text to
 */
function updateAll(textSize, lineHeight, font = "Droid Arabic Naskh") {
    getArabicTextNodesIn(document.body).forEach((it) => updateNode(it, textSize, lineHeight, font));
}
/**
 * Starts the observer that will observe for any additions to the document and update them if they have any
 * Arabic text and they have not been updated yet
 * @param textSize the size to update the text to
 * @param lineHeight the height to update the line to
 * @param font the name of the font to update the text to
 */
function startObserver(textSize, lineHeight, font = "Droid Arabic Naskh") {
    let config = {
        attributes: false,
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: false,
    };
    let callback = function (mutationsList) {
        mutationsList.forEach((record) => {
            // If something has been added
            if (record.addedNodes.length > 0) {
                //  For each added node
                record.addedNodes.forEach((addedNode) => {
                    // For each node with Arabic script in addedNode
                    getArabicTextNodesIn(addedNode).forEach((arabicNode) => {
                        // Update arabicNode only if it hasn't been updated
                        if (arabicNode.parentElement && arabicNode.parentElement.getAttribute("class") != "ar") {
                            updateNode(arabicNode, textSize, lineHeight, font);
                        }
                    });
                });
            }
        });
    };
    observer = new MutationObserver(callback);
    observer.observe(document.body, config);
}
/**
 * Main execution:
 * Updates all existing text according to the options
 * Then starts an observer with those same options to update any new text that will come
 * This only happens if the on off switch is on and the site is not whitelisted
 */
browser.storage.sync.get(["textSize", "lineHeight", "onOff", "font", "whitelisted"]).then((fromStorage) => {
    let textSize = fromStorage.textSize;
    let lineHeight = fromStorage.lineHeight;
    let checked = fromStorage.onOff;
    let font = fromStorage.font;
    let whitelisted = fromStorage.whitelisted;
    let isWhitelisted = whitelisted.contains(new URL(document.URL).hostname);
    // Only do anything if the switch is on and this site is not whitelisted
    if (checked && !isWhitelisted) {
        updateAll(textSize, lineHeight, font);
        startObserver(textSize, lineHeight, font);
    }
});
/**
 * Listener to update text if options are modified, the options being text size, line height and font
 * Since the original font is not saved, reverting the text to it's original form is not possible
 * This will disconnect the previous observer and start a new one its place with the new options
 * The check whether the switch is on or if this site is whitelisted is not done here but at the
 * sender's sendMessage call
 */
browser.runtime.onMessage.addListener(function (message) {
    let newSize = 100 * (message.newSize / message.oldSize);
    let newHeight = 100 * (message.newHeight / message.oldHeight);
    updateAll(newSize, newHeight, message.font);
    observer.disconnect();
    startObserver(newSize, newHeight, message.font);
});
//# sourceMappingURL=main.js.map