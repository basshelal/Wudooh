/**
 * This is the main script that reads the document and updates any Arabic script text
 */

///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>
///<reference path="./shared.ts"/>

import sync = chrome.storage.sync;
import runtime = chrome.runtime;

/**
 * @deprecated use {@link newArabicRegex} instead
 */
const arabicRegEx = new RegExp("([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF]+(" +
    " [\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\W\d]+)*)", "g");

/**
 * This Arabic regex allows and accepts any non Arabic symbols next to Arabic symbols,
 * this means that it accepts anything as long as it has some Arabic symbol in it
 */
const newArabicRegex = new RegExp("[\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF]+", "g");

/** The observer used in {@linkcode startObserver} to dynamically update any newly added Nodes */
let observer: MutationObserver;

/**
 * Returns whether the given node has any Arabic script or not, this is any script that matches arabicRegEx
 * @param node the node to check
 * @return true if the node contains any arabic script, false otherwise
 */
function hasArabicScript(node: Node): boolean {
    return !!(node.nodeValue && (node.nodeValue.trim() != "") && (node.nodeValue.match(newArabicRegex)));
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
        NodeFilter.SHOW_ALL
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

    // return if parent or node are null
    if (!parent || !node) return;
    // don't change anything if this node or its parent are editable
    if (isEditable(parent) || isEditable(node)) return;

    let nextSibling: ChildNode = node.nextSibling;

    // the div is temporary and doesn't show up in the html
    let newElement: HTMLDivElement = document.createElement("div");
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
function isEditable(node: Node): boolean {
    let element: HTMLElement = node as HTMLElement;
    let nodeName: string = element.nodeName.toLowerCase();

    let editables: Array<string> = ["textarea", "input", "text", "email", "number", "search", "tel", "url", "password"];

    return (element.isContentEditable || (element.nodeType === Node.ELEMENT_NODE && !!editables.findFirst((it) => it === nodeName)));
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
function updateNode(node: Node, textSize: number, lineHeight: number, font: string = defaultFont) {
    if (node.nodeValue) {
        let newSize: number = textSize / 100;
        let newHeight: number = lineHeight / 100;

        updateByAdding(node, newSize, newHeight, font);
    }
}

function updateByAdding(node: Node, textSize: number, lineHeight: number, font: string) {
    let newHTML: string;
    if (font === "Original") {
        newHTML = "<span wudooh='true' style='" +
            "font-size:" + textSize + "em;" +
            "line-height:" + lineHeight + "em;" +
            "'>$&</span>";
    } else {
        newHTML = "<span wudooh='true' style='" +
            "font-size:" + textSize + "em;" +
            "line-height:" + lineHeight + "em;" +
            "font-family:" + "\"" + font + "\";" +
            "'>$&</span>";
    }

    let text: string = node.nodeValue.replace(newArabicRegex, newHTML);
    setNodeHtml(node, text);
}

/**
 * Updates all Arabic script nodes in this document's body by calling updateNode() on each node in this document
 * with Arabic script
 * @param textSize the size to update the text to
 * @param lineHeight the height to update the line to
 * @param font the name of the font to update the text to
 */
function updateAll(textSize: number, lineHeight: number, font: string = defaultFont) {
    getArabicTextNodesIn(document.body).forEach((it: Node) => updateNode(it, textSize, lineHeight, font));
}

/**
 * Starts the observer that will observe for any additions to the document and update them if they have any
 * Arabic text and they have not been updated yet
 * @param textSize the size to update the text to
 * @param lineHeight the height to update the line to
 * @param font the name of the font to update the text to
 */
function startObserver(textSize: number, lineHeight: number, font: string = defaultFont) {

    let config: MutationObserverInit = {
        attributes: false, // we don't care about attribute changes
        attributeOldValue: false, // we don't care about attribute changes
        characterData: true, // we get notified of any changes to character data
        characterDataOldValue: true, // we keep the old value
        childList: true, // we get notified about changes to a node's children
        subtree: true, // we get notified about any changes to any of a node's descendants
    };

    let callback: MutationCallback = (mutationsList: MutationRecord[]) => {
        mutationsList.forEach((record: MutationRecord) => {
            // If something has been added
            if (record.addedNodes.length > 0) {

                //  For each added node
                record.addedNodes.forEach((addedNode: Node) => {

                    // For each node with Arabic script in addedNode
                    getArabicTextNodesIn(addedNode).forEach((arabicNode: Node) => {

                        // Update arabicNode only if it hasn't been updated
                        if (arabicNode.parentElement && arabicNode.parentElement.getAttribute("wudooh") != "true") {
                            updateNode(arabicNode, textSize, lineHeight, font);
                        }
                    });
                });
            }

            // If the value has changed
            if (record.target.nodeValue !== record.oldValue && record.target.parentNode instanceof Node) {

                // If the node now has Arabic text when it didn't, this is rare and only occurs on YouTube
                getArabicTextNodesIn(record.target.parentNode).forEach((arabicNode: Node) => {

                    // Update arabicNode only if it hasn't been updated
                    if (arabicNode.parentElement && arabicNode.parentElement.getAttribute("wudooh") != "true") {
                        updateNode(arabicNode, textSize, lineHeight, font);
                    }
                });
            }
        });
    };

    if (!observer) {
        observer = new MutationObserver(callback);
        observer.observe(document.body, config);
    }
}

// Tell this document that Wudooh has been executed on it
function notify() {
    let meta = document.createElement("meta");
    meta.setAttribute("wudooh", "true");
    document.head.appendChild(meta);
}

/**
 * Main execution:
 * Updates all existing text according to the options
 * Then starts an observer with those same options to update any new text that will come
 * This only happens if the on off switch is on and the site is not whitelisted
 */
sync.get(keys, (fromStorage) => {
    let textSize: number = fromStorage.textSize;
    let lineHeight: number = fromStorage.lineHeight;
    let isOn: boolean = fromStorage.onOff;
    let font: string = fromStorage.font;
    let whitelisted: Array<string> = fromStorage.whitelisted;
    let customSettings: Array<CustomSettings> = fromStorage.customSettings;

    let thisHostname: string = new URL(document.URL).hostname;
    let isWhitelisted: boolean = !!whitelisted.findFirst((it) => it === thisHostname);

    let customSite: CustomSettings = customSettings.findFirst((custom: CustomSettings) => custom.url === thisHostname);

    // Only do anything if the switch is on and this site is not whitelisted
    if (isOn && !isWhitelisted) {

        // If it's a custom site then change the textSize, lineHeight and font
        if (customSite) {
            textSize = customSite.textSize;
            lineHeight = customSite.lineHeight;
            font = customSite.font;
        }
        updateAll(textSize, lineHeight, font);
        startObserver(textSize, lineHeight, font);
        notify();
    }
});

/**
 * Listener to update text if options are modified, the options being text size, line height and font
 * Since the original font is not saved, reverting the text to it's original form is not possible
 * This will disconnect the previous observer and start a new one its place with the new options
 * The check whether the switch is on or if this site is whitelisted is not done here but at the
 * sender's sendMessage call
 */
runtime.onMessage.addListener((message) => {
    let newSize: number = 100 * (message.newSize / message.oldSize);
    let newHeight: number = 100 * (message.newHeight / message.oldHeight);
    updateAll(newSize, newHeight, message.font);

    if (!observer) {
        observer.disconnect();
        observer = null;
    }
    startObserver(newSize, newHeight, message.font);
});