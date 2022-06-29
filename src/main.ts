/**
 * This Arabic regex allows and accepts any non Arabic symbols next to Arabic symbols,
 * this means that it accepts anything as long as it has some Arabic symbol in it
 */
const arabicRegex: RegExp = new RegExp("[\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\]+([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\\W\\d]+)*", "g")

/** The observer used in {@linkcode startObserver} to dynamically update any newly added Nodes */
let observer: MutationObserver | null = null

/**
 * Returns true if the passed in Node has been updated by Wudooh and false otherwise
 */
function hasNodeBeenUpdated(node: Node): boolean {
    return !!node && !!node.parentElement && node.parentElement.getAttribute("wudooh") === "true"
}

/**
 * Returns true if this document has already been updated by Wudooh before,
 * this is done in {@link notifyDocumentHasUpdated}
 */
function hasDocumentBeenUpdated(): boolean {
    return document.getElementById("wudoohMetaElement") !== null
}

/**
 * Returns whether the given node has any Arabic script or not, this is any script that matches arabicRegEx.
 * `true` if it does and false otherwise
 */
function hasArabicScript(node: Node): boolean {
    return !!node.nodeValue && !!(node.nodeValue.match(arabicRegex))
}

/**
 * Gets all nodes within the passed in node that have any Arabic text
 * @param rootNode the node to use as the root of the traversal
 * @return an array of nodes that contain all the nodes with Arabic text that are children of the passed in
 * root node
 */
function getArabicTextNodesIn(rootNode: Node): Array<Node> {
    let treeWalker: TreeWalker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT
    )
    let arabicTextNodes: Array<Node> = []

    let node: Node | null = treeWalker.nextNode()
    while (!!node) {
        if (hasArabicScript(node)) arabicTextNodes.push(node)
        node = treeWalker.nextNode()
    }
    return arabicTextNodes
}

async function updateByAdding(node: Node, textSize: number, lineHeight: number, font: string): Promise<void> {
    const parent: Node | null = !!node ? node.parentNode : null
    // return if parent or node are null
    if (!parent) return
    // don't do anything if this node or its parent are editable
    if (isNodeEditable(parent) || isNodeEditable(node)) return

    let newHTML: string
    if (font === "Original") {
        newHTML = "<span wudooh='true' style='" +
            "font-size:" + textSize + "em;" +
            "line-height:" + lineHeight + "em;" +
            "'>$&</span>"
    } else {
        newHTML = "<span wudooh='true' style='" +
            "font-size:" + textSize + "em;" +
            "line-height:" + lineHeight + "em;" +
            "font-family:" + "\"" + font + "\";" +
            "'>$&</span>"
    }

    if (!node.nodeValue) return
    const text: string = node.nodeValue.replace(arabicRegex, newHTML)

    const nextSibling: ChildNode | null = node.nextSibling

    // the div is temporary and doesn't show up in the html
    let newElement: HTMLDivElement = document.createElement("div")
    newElement.innerHTML = text

    while (newElement.firstChild) {
        // we only insert the passed in html, the div is not inserted
        parent.insertBefore(newElement.firstChild, nextSibling)
    }
    parent.removeChild(node)
}

async function updateByChanging(node: Node, textSize: number, lineHeight: number, font: string): Promise<void> {
    if (!node || !node.parentElement) return
    node.parentElement.style.fontSize = textSize + "em"
    node.parentElement.style.lineHeight = lineHeight + "em"
    if (font === "Original") node.parentElement.style.fontFamily = ""
    else node.parentElement.style.fontFamily = font
}

/**
 * Adds an element to this document to notify that Wudooh (this ts file) has been run on it,
 * if this has been called then {@link notifyDocumentHasUpdated} will return `true`
 * Multiple calls to this do nothing after the first
 */
async function notifyDocumentHasUpdated(): Promise<void> {
    if (!hasDocumentBeenUpdated()) {
        let meta: HTMLMetaElement = document.createElement("meta")
        meta.id = "wudoohMetaElement"
        meta.setAttribute("wudooh", "true")
        document.head.appendChild(meta)
    }
}

async function toggleOff(): Promise<void> {
    if (!!observer) {
        observer.disconnect()
        observer = null
    }
    getArabicTextNodesIn(document.body).forEach((node: Node) => {
        if (!!node && !!node.parentElement && !!node.parentElement.style) {
            node.parentElement.style.fontSize = ""
            node.parentElement.style.lineHeight = ""
            node.parentElement.style.fontFamily = ""
        }
    })
}

async function addMessageListener(): Promise<void> {
    runtime.onMessage.addListener((message: Message) => {
        switch (message.reason) {
            case MessageReasons.updateAllText:
                updateDocument()
                break
            case MessageReasons.injectCustomFonts:
                injectCustomFonts(message.data)
                break
            case MessageReasons.toggleOff:
                toggleOff()
                break
        }
    })
}

// TODO: Use a new message for has become whitelisted because this is just confusing and unintuitive
//       (despite working)

addMessageListener()

const plugins: Array<WudoohPlugin> = []

async function updateDocument() {

}

async function pluginsUpdateBeforeAll(): Promise<void> {
    await plugins.forEachAsync(async (plugin: WudoohPlugin) => {
        if (!!plugin.beforeUpdateAll) {
            await plugin.beforeUpdateAll()
        }
    })
}

async function pluginsUpdateAfterAll(): Promise<void> {
    await plugins.forEachAsync(async (plugin: WudoohPlugin) => {
        if (!!plugin.afterUpdateAll) {
            await plugin.afterUpdateAll()
        }
    })
}

async function updateNodeAndChildren(rootNode: Node,
                                     modificationReason: WudoohNodeModificationReason): Promise<void> {
    // TODO: Figure out what we use for whatToShow in NodeIterator!
    const iterator: NodeIterator = document.createNodeIterator(rootNode, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ALL)
    let node: Node | null
    while (!!(node = iterator.nextNode())) {
        plugins.forEachAsync(async (plugin: WudoohPlugin): Promise<void> => {
            if (!!plugin.update) {
                await plugin.update(node!, modificationReason)
            }
        })
    }
}

async function startMutationObserver(): Promise<void> {
    if (!observer) {
        const config: MutationObserverInit = {
            attributes: false, // we don't care about attribute changes
            attributeOldValue: false, // we don't care about attribute changes
            characterData: true, // we get notified of any changes to character data
            characterDataOldValue: true, // we keep the old value
            childList: true, // we get notified about changes to any children of the target (document.body)
            subtree: true // we get notified about any changes to any of descendants of the target (document.body)
        }

        const callback: MutationCallback = async (mutationsList: Array<MutationRecord>): Promise<void> => {
            if (mutationsList.length > 0) {
                await pluginsUpdateBeforeAll()
            }
            mutationsList.forEach((record: MutationRecord): void => {
                if (record.type === "characterData") { // Node's data has changed
                    if (record.target.nodeValue !== record.oldValue) {
                        updateNodeAndChildren(record.target, "dataChanged")
                    }
                } else if (record.type === "childList") { // Node's children have changed
                    record.addedNodes.forEach((addedNode: Node): void => {
                        updateNodeAndChildren(addedNode, "added")
                    })
                    record.removedNodes.forEach((removedNode: Node): void => {
                        updateNodeAndChildren(removedNode, "removed")
                    })
                }
            })
            if (mutationsList.length > 0) {
                await pluginsUpdateAfterAll()
            }
        }

        observer = new MutationObserver(callback)
        observer.observe(document.body, config)
    }
}

async function newMain(): Promise<void> {
    const url: URL = new URL(document.URL)
    const foundPlugins: Array<WudoohPlugin> = await wudoohPlugins.filterAsync(async (plugin: WudoohPlugin): Promise<boolean> => {
        return plugin.urlRequiresUpdate(url)
    })

    const exclusivePlugin: WudoohPlugin | undefined = foundPlugins.find((plugin: WudoohPlugin): boolean => {
        return plugin.isExclusivePlugin ?? false
    })

    log.v(`URL: ${url}, plugins: ${foundPlugins.map((plugin: WudoohPlugin) => plugin.id)}`)
    if (!!exclusivePlugin) {
        log.v(`Exclusive: ${exclusivePlugin.id}`)
        plugins.push(exclusivePlugin)
    } else {
        plugins.push(...foundPlugins)
    }

    onDOMContentLoaded(async () => {
        log.v(`DOM loaded at: ${now()}`)
        await pluginsUpdateBeforeAll()
        await updateNodeAndChildren(document.body, "newlyLoaded")
        await pluginsUpdateAfterAll()
        await startMutationObserver()
        log.v(`Finished DOM loaded callback at: ${now()}`)
    })
}

log.v(`Started at: ${now()}`)
newMain()
// TODO: Idea for possibly better performance! Have the content script run at "document_start" ie as the DOM is loading
//  and only use the MutationObserver to modify Nodes as they come, with possibly a second run in case something was
//  missed

// TODO: Idea for modularity! Make the fonts be fetched from GitHub, that way we can update them at any point, and the
//  extension is really small, this may decrease performance though