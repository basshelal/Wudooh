///<reference path="../../../.WebStorm2019.1/config/javascript/extLibs/global-types/node_modules/@types/chrome/index.d.ts"/>

import sync = chrome.storage.sync;
import runtime = chrome.runtime;

/**
 * This is the main script that reads the document and updates any Arabic script text
 */

const arabicRegEx = new RegExp('([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF]+(' +
    ' [\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\W\d]+)*)', 'g');

const defaultFont: string = "Droid Arabic Naskh";

// TODO figure out a way to have common code in one place instead of all this duplicated code

// TODO change customSettings to be a Set so that we guarantee no duplicates!
//  maybe same for whiteListed but that would mean a db migration

/** The keys of the {@linkcode chrome.storage.sync} */
const keys = [
    /** The font size percent, between 100 and 200 */
    "textSize",
    /** The line height percent, between 100 and 200 */
    "lineHeight",
    /** Determines whether the extension is on or off, true is on */
    "onOff",
    /** The font to update to, this is a string */
    "font",
    /** The array of strings of whitelisted websites, this contains their hostnames in the format example.com */
    "whitelisted",
    /** The array of {@linkcode CustomSettings} that represents the sites with custom settings */
    "customSettings"
];

/**
 * Represents a site that uses different settings from the default settings
 * The settings themselves may be the same as the default but they will change independently
 */
class CustomSettings {
    /** The hostname url of this web site, this will always be in the form of example.com */
    url: string;
    /** The font size to use on this site */
    textSize: number;
    /** The line height to use on this site */
    lineHeight: number;
    /** The font to use on this site */
    font: string;

    constructor(url: string, textSize: number,
                lineHeight: number, font: string) {
        this.url = url;
        this.textSize = textSize;
        this.lineHeight = lineHeight;
        this.font = font;
    }
}

/** The observer used in {@linkcode startObserver} to dynamically update any newly added Nodes */
let observer: MutationObserver;

interface Array<T> {

    findFirst(predicate: (element: T, index: number) => boolean): T | null;
}

/**
 * Finds the first element that matches the given {@param predicate} else returns null
 * You can use this as a way to check if the array contains an element that matches the given {@param predicate}, it
 * will return null if none exists
 * @param predicate the predicate to match
 */
Array.prototype.findFirst = function <T>(predicate: (element: T, index: number) => boolean): T | null {
    for (let i = 0; i < this.length; i++) {
        if (predicate(this[i], i)) return this[i];
    }
    return null;
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
        let newHTML: string;
        let element: HTMLElement = node.parentElement;

        if (font === "Original") {
            newHTML = "<span wudooh='true'' style='" +
                "font-size:" + newSize + "em;" +
                "line-height:" + newHeight + "em;" +
                "'>$&</span>";
            let text: string = node.nodeValue.replace(arabicRegEx, newHTML);
            setNodeHtml(node, text);
        } else {
            updateByAdding(node, newSize, newHeight, font);
        }
    }
}

// TODO remove this later
function updateByStyling(element: HTMLElement, textSize: number, lineHeight: number, font: string) {
    element.dir = "rtl";
    element.style.fontSize = textSize + "em";
    element.style.lineHeight = lineHeight + "em";
    element.style.fontFamily = "\"" + font + "\"" + "," + "sans-serif";
    element.setAttribute("wudooh", "true");
}

function updateByAdding(node: Node, textSize: number, lineHeight: number, font: string) {
    let newHTML = "<span wudooh='true' dir='rtl' style='" +
        "font-size:" + textSize + "em;" +
        "line-height:" + lineHeight + "em;" +
        "font-family:" + "\"" + font + "\"" + "," + "sans-serif;" +
        "'>$&</span>";

    let text: string = node.nodeValue.replace(arabicRegEx, newHTML);
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
        characterDataOldValue: false, // we don't keep the old value
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
        });
    };

    if (!observer) {
        observer = new MutationObserver(callback);
        observer.observe(document.body, config);
    }
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
    }

    log();
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

    log()
});

// TODO REMOVE LATER!
function log() {
    sync.get(null, (items) => {
        keys.forEach((key) => {
            if (key === "customSettings") {
                console.log(key + " : " + items[key].length);
                (items[key] as Array<CustomSettings>).forEach((customSetting: CustomSettings) =>
                    console.log(customSetting.url));
            } else {
                console.log(key + " : " + items[key]);
            }
        })
    });
}