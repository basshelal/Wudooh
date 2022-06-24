/**
 * This Arabic regex allows and accepts any non Arabic symbols next to Arabic symbols,
 * this means that it accepts anything as long as it has some Arabic symbol in it
 */
const arabicRegex: RegExp = new RegExp("([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\]+([\u0600-\u06FF\u0750-\u077F\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\\W\\d]+)*)", "g")

const htmlEditables: Array<string> = ["textarea", "input", "text", "email", "number", "search", "tel", "url", "password"]

/** The observer used in {@linkcode startObserver} to dynamically update any newly added Nodes */
let observer: MutationObserver | null = null

interface WudoohPlugin {
    /** Returns `true` if the node has been updated previously, this is set for you, do not modify */
    hasNodeUpdated?: (node: Node) => boolean
    /**
     * Return `true` for updates to proceed on this document
     * otherwise, no further callbacks will be made. This is called once
     * This is required
     */
    readonly urlRequiresUpdate: (url: URL) => boolean | Promise<boolean>
    /**
     * Called before a single loop of multiple {@link requiresUpdate} calls,
     * use this to set up any state or expensive computation (such as getting values from storage
     * which will not change often) before the update loop
     */
    readonly beforeUpdateAll?: () => void | Promise<void>
    /**
     * Return `true` if this node will need to be updated in {@link update},
     * otherwise, no further calls will be made for this node
     * This is required
     */
    readonly requiresUpdate: (node: Node) => boolean | Promise<boolean>
    /**
     * Called immediately before {@link update}
     */
    readonly beforeUpdate?: (node: Node) => void | Promise<void>
    /**
     * The actual node updating function
     */
    readonly update?: (node: Node) => void | Promise<void>
    /**
     * Called immediately after {@link update}
     * After this point the node will be able to be queried for {@link hasNodeUpdated}
     */
    readonly afterUpdate?: (node: Node) => void | Promise<void>
    /**
     * Called after a single loop of multiple {@link requiresUpdate} calls,
     * the equivalent of {@link beforeUpdateAll}.
     * Use this for any clean up required after {@link beforeUpdateAll}
     */
    readonly afterUpdateAll?: () => void | Promise<void>
}

/**
 * Extend this class if your {@link WudoohPlugin} is a `class`.
 * This provides you with the default implementation of {@link hasNodeUpdated} which should NOT
 * be overridden.
 */
class AbstractWudoohPlugin {
    hasNodeUpdated(node: Node): boolean {return hasNodeBeenUpdated(node)}
}

class DefaultPlugin extends AbstractWudoohPlugin implements WudoohPlugin {
    /** Hostname of current URL, set in {@link urlRequiresUpdate} */
    private urlHostname!: string
    /** The {@link WudoohStorage} first fetched in {@link beforeUpdateAll} */
    private storage!: WudoohStorage
    /** The {@link CustomSetting} of this site, if it exists, `undefined` otherwise */
    private customSetting?: CustomSetting | undefined

    async urlRequiresUpdate(url: URL): Promise<boolean> {
        // true only if Wudooh is on and this url is not whitelisted
        this.urlHostname = url.hostname
        this.storage = await sync.get(WudoohKeys.all())
        return (!!this.storage.onOff && this.storage.onOff) &&
            (!!this.storage.whitelisted && !this.storage.whitelisted.contains(this.urlHostname))
    }

    async beforeUpdateAll(): Promise<void> {
        this.customSetting = this.storage.customSettings ? this.storage.customSettings.find((custom: CustomSetting) => custom.url === this.urlHostname) : undefined
        if (!!this.storage.customFonts) injectCustomFonts(this.storage.customFonts)
    }

    requiresUpdate(node: Node): boolean {
        return !this.hasNodeUpdated(node) && hasArabicScript(node) && !isNodeEditable(node)
    }

    beforeUpdate(node: Node): void {

    }

    update(node: Node): void {

    }

    afterUpdate(node: Node): void {

    }

    afterUpdateAll(): void {

    }
}

const YoutubePlugin: WudoohPlugin = {
    urlRequiresUpdate(url: URL): boolean {
        return url.hostname === "youtube.com" || url.hostname === "www.youtube.com"
    },
    requiresUpdate(node: Node): boolean {
        return (!!this.hasNodeUpdated && !this.hasNodeUpdated(node)) && hasArabicScript(node) && !isNodeEditable(node)
    }
}

const wudoohPlugins: Array<WudoohPlugin> = [YoutubePlugin]

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
 * Checks whether the passed in node is editable or not, `true` if editable, `false` otherwise
 * These will generally need to be ignored to avoid any conflicts with the site or the user's formatting
 */
function isNodeEditable(node: Node): boolean {
    if (!node) return false
    const element: HTMLElement = node as HTMLElement
    const nodeName: string = element.nodeName.toLowerCase()

    return (element.isContentEditable || (element.nodeType === Node.ELEMENT_NODE && htmlEditables.contains(nodeName)))
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
async function updateNode(node: Node, textSize: number, lineHeight: number, font: string): Promise<void> {
    let newSize: number = textSize / 100
    let newHeight: number = lineHeight / 100

    if (!!node.nodeValue) {
        if (hasNodeBeenUpdated(node)) updateByChanging(node, newSize, newHeight, font)
        else if (!hasNodeBeenUpdated(node)) updateByAdding(node, newSize, newHeight, font)
    }
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
 * Updates all Arabic script nodes in this document's body by calling updateNode() on each node in this document
 * with Arabic script
 * @param textSize the size to update the text to
 * @param lineHeight the height to update the line to
 * @param font the name of the font to update the text to
 */
async function updateAll(textSize: number, lineHeight: number, font: string): Promise<void> {
    getArabicTextNodesIn(document.body).forEach((it: Node) => updateNode(it, textSize, lineHeight, font))
}

/**
 * Starts the observer that will observe for any additions to the document and update them if they have any
 * Arabic text and they have not been updated yet
 * @param textSize the size to update the text to
 * @param lineHeight the height to update the line to
 * @param font the name of the font to update the text to
 */
async function startObserver(textSize: number, lineHeight: number, font: string): Promise<void> {
    // If observer was existing then disconnect it and delete it
    if (!!observer) {
        observer.disconnect()
        observer = null
    }
    // Only do anything if observer is null
    if (!observer) {
        const config: MutationObserverInit = {
            attributes: false, // we don't care about attribute changes
            attributeOldValue: false, // we don't care about attribute changes
            characterData: true, // we get notified of any changes to character data
            characterDataOldValue: true, // we keep the old value
            childList: true, // we get notified about changes to a node's children
            subtree: true // we get notified about any changes to any of a node's descendants
        }

        const callback: MutationCallback = (mutationsList: Array<MutationRecord>) => {
            mutationsList.forEach((record: MutationRecord) => {
                // If something has been added
                if (record.addedNodes.length > 0) {
                    //  For each added node
                    record.addedNodes.forEach((addedNode: Node) => {
                        // For each node with Arabic script in addedNode
                        getArabicTextNodesIn(addedNode).forEach((arabicNode: Node) => {
                            updateNode(arabicNode, textSize, lineHeight, font)
                        })
                    })
                }

                // If the value has changed
                if (record.target.nodeValue !== record.oldValue && record.target.parentNode instanceof Node) {
                    // If the node now has Arabic text when it didn't, this is rare and only occurs on YouTube
                    getArabicTextNodesIn(record.target.parentNode).forEach((arabicNode: Node) => {
                        updateNode(arabicNode, textSize, lineHeight, font)
                    })
                }
            })
        }

        observer = new MutationObserver(callback)
        observer.observe(document.body, config)
    }
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
                main()
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

async function main(): Promise<void> {
    const storage: WudoohStorage = await sync.get(WudoohKeys.all())
    let textSize: number = storage.textSize ?? DefaultWudoohStorage.textSize!
    let lineHeight: number = storage.lineHeight ?? DefaultWudoohStorage.lineHeight!
    let font: string = storage.font ?? DefaultWudoohStorage.font!
    const isOn: boolean = storage.onOff ?? DefaultWudoohStorage.onOff!
    const whitelisted: Array<string> = storage.whitelisted ?? DefaultWudoohStorage.whitelisted!
    const customSettings: Array<CustomSetting> = storage.customSettings ?? DefaultWudoohStorage.customSettings!
    const customFonts: Array<CustomFont> = storage.customFonts ?? DefaultWudoohStorage.customFonts!

    const thisURL: string = new URL(document.URL).hostname
    const isWhitelisted: boolean = !!whitelisted.find((it) => it === thisURL)

    const customSite: CustomSetting | undefined = customSettings.find((custom: CustomSetting) => custom.url === thisURL)

    // Only do anything if the switch is on and this site is not whitelisted
    if (isOn && !isWhitelisted) {
        injectCustomFonts(customFonts)
        // If it's a custom site then change the textSize, lineHeight and font
        if (!!customSite) {
            textSize = customSite.textSize
            lineHeight = customSite.lineHeight
            font = customSite.font
        }
        updateAll(textSize, lineHeight, font)
        // Force a second attempt for pesky websites
        onDOMContentLoaded(() => wait(1000, () =>
            updateAll(textSize, lineHeight, font))
        )
        wait(1000, () => updateAll(textSize, lineHeight, font))
        startObserver(textSize, lineHeight, font)
        notifyDocumentHasUpdated()
    }
    // TODO: Use a new message for has become whitelisted because this is just confusing and unintuitive
    //       (despite working)
    // We've been updated and now we've become whitelisted
    if (hasDocumentBeenUpdated() && isWhitelisted) {
        toggleOff()
    }
}

main()
addMessageListener()
