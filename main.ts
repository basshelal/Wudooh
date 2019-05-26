///<reference path="../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>

/**
 * This is the main script that reads the document and updates any Arabic script text
 */

const arabicRegEx = new RegExp('([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF]+(' +
    ' [\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\W\d]+)*)', 'g');

interface Array<T> {
    contains(element: T): boolean;
}

Array.prototype.contains = function <T>(element: T): boolean {
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
function hasArabicScript(node: Node): boolean {
    return !!(node.nodeValue && (node.nodeValue.trim() != "") && (node.nodeValue.match(arabicRegEx)));
}

/**
 * Gets all nodes within the passed in node that have any Arabic text
 * @param rootNode the node to use as the root of the traversal
 * @return an array of nodes that contain all the nodes with Arabic text that are children of the passed in
 * root node
 */
function getArabicTextNodesIn(rootNode: Node): Array<Node> {

    let walker: TreeWalker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT
    );

    let node: Node;
    let arabicTextNodes: Array<Node> = [];

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
function setNodeHtml(node: Node, html: string) {
    let parent: Node = node.parentNode;

    if (!parent || !node) return;

    let next = node.nextSibling;
    let parser = document.createElement('div');
    parser.innerHTML = html;
    while (parser.firstChild) {
        parent.insertBefore(parser.firstChild, next);
    }
    parent.removeChild(node);
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
function updateNode(node: Node, textSize: number, lineHeight: number, font: string = "Droid Arabic Naskh") {
    if (node.nodeValue) {
        let newSize = textSize / 100;
        let newHeight = lineHeight / 100;
        let newHTML = "<span class='ar'' style='" +
            "font-size:" + newSize + "em;" +
            "line-height:" + newHeight + "em;" +
            "font-family:" + "\"" + font + "\"" + "," + "sans-serif;" +
            "'>$&</span>";
        let text: string = node.nodeValue.replace(arabicRegEx, newHTML);
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
function updateAll(textSize: number, lineHeight: number, font: string = "Droid Arabic Naskh") {
    getArabicTextNodesIn(document.body).forEach((it: Node) => updateNode(it, textSize, lineHeight, font));
}

/**
 * Starts the observer that will observe for any additions to the document and update them if they have any
 * Arabic text and they have not been updated yet
 * @param textSize the size to update the text to
 * @param lineHeight the height to update the line to
 * @param font the name of the font to update the text to
 */
function startObserver(textSize: number, lineHeight: number, font: string = "Droid Arabic Naskh") {

    let config: MutationObserverInit = {
        attributes: false,
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: false,
    };

    let callback: MutationCallback = function (mutationsList: MutationRecord[]) {
        mutationsList.forEach((record: MutationRecord) => {
            // If something has been added
            if (record.addedNodes.length > 0) {

                //  For each added node
                record.addedNodes.forEach((addedNode: Node) => {

                    // For each node with Arabic script in addedNode
                    getArabicTextNodesIn(addedNode).forEach((arabicNode: Node) => {

                        // Update arabicNode only if it hasn't been updated
                        if (arabicNode.parentElement && arabicNode.parentElement.getAttribute("class") != "ar") {
                            updateNode(arabicNode, textSize, lineHeight, font);
                        }
                    });
                });
            }
        });
    };

    new MutationObserver(callback).observe(document.body, config);
}

chrome.storage.sync.get(["textSize", "lineHeight", "onOff", "font", "whitelisted"], (fromStorage) => {
    let textSize: number = fromStorage.textSize;
    let lineHeight: number = fromStorage.lineHeight;
    let checked: boolean = fromStorage.onOff;
    let font: string = fromStorage.font;
    let whitelisted: Array<string> = fromStorage.whitelisted;

    let isWhitelisted = whitelisted.contains(new URL(document.URL).hostname);

    // Only do anything if the on off switch is on
    if (checked && !isWhitelisted) {
        updateAll(textSize, lineHeight, font);
        startObserver(textSize, lineHeight, font);
    }
});

chrome.runtime.onMessage.addListener(function (message) {
    let newSize = 100 * (message.newSize / message.oldSize);
    let newHeight = 100 * (message.newHeight / message.oldHeight);
    updateAll(newSize, newHeight, message.font);
});