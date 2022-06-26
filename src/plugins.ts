interface WudoohPlugin {
    /** Unique identifier or name of plugin, this is required */
    id: string
    /**
     * Set to `true` to signify that this plugin will be the only plugin to run on this URL when
     * {@link urlRequiresUpdate} returns `true`, this means that NO other plugin will run, including
     * the {@link DefaultPlugin}. This should be used sparingly and only for urls that need to
     * replace the {@link DefaultPlugin} behavior. If multiple plugins have this set to `true` for
     * a single URL then Wudooh will use the first one it finds, if you must combine some other
     * plugin's behavior for this URL then you should call that plugin's callback functions in
     * your callback implementations to create a "merging" plugin.
     */
    readonly isExclusivePlugin?: boolean
    // ==========================================================================
    // ========================== Callbacks =====================================
    // ==========================================================================

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

    // TODO: Plugins need to also implement un-updating callbacks, meaning callbacks called
    //  when Wudooh wants to revert the changes made
}

/**
 * Extend this class if your {@link WudoohPlugin} is a `class`.
 * This provides you with the default implementation of {@link hasNodeUpdated} which should NOT
 * be overridden.
 */
class AbstractWudoohPlugin {
    public hasNodeUpdated(node: Node): boolean {return hasNodeBeenUpdated(node)}
}

const DefaultPlugin = new (class DefaultPlugin extends AbstractWudoohPlugin implements WudoohPlugin {
    public id: string = "DefaultPlugin"

    public isExclusivePlugin: boolean = false

    /** Hostname of current URL, set in {@link urlRequiresUpdate} */
    private urlHostname!: string
    /** The {@link WudoohStorage} first fetched in {@link beforeUpdateAll} */
    private storage!: WudoohStorage
    /** The {@link CustomSetting} of this site, if it exists, `undefined` otherwise */
    private customSetting?: CustomSetting | undefined

    public async urlRequiresUpdate(url: URL): Promise<boolean> {
        // true only if Wudooh is on and this url is not whitelisted
        this.urlHostname = url.hostname
        this.storage = await sync.get(WudoohKeys.all())
        return (!!this.storage.onOff && this.storage.onOff) &&
            (!!this.storage.whitelisted && !this.storage.whitelisted.contains(this.urlHostname))
    }

    public async beforeUpdateAll(): Promise<void> {
        this.customSetting = this.storage.customSettings ?
            this.storage.customSettings.find((custom: CustomSetting) => custom.url === this.urlHostname) : undefined
        if (!!this.storage.customFonts) injectCustomFonts(this.storage.customFonts)
    }

    public requiresUpdate(node: Node): boolean {
        return !this.hasNodeUpdated(node) && hasArabicScript(node) && !isNodeEditable(node)
    }

    public beforeUpdate(node: Node): void {

    }

    public update(node: Node): void {
        console.log("Update called at: " + Date.now())
    }

    public afterUpdate(node: Node): void {

    }

    public afterUpdateAll(): void {

    }

    public notifyNodeUpdated(node: Node): void {
        // TODO: Mark node as updated and hasNodeUpdated should return true for this node, no more updates
    }
})()

const YoutubePlugin: WudoohPlugin = {
    id: "YoutubePlugin",
    isExclusivePlugin: true,
    urlRequiresUpdate(url: URL): boolean {
        return url.hostname === "youtube.com" || url.hostname === "www.youtube.com"
    },
    requiresUpdate(node: Node): boolean {
        return (!!this.hasNodeUpdated && !this.hasNodeUpdated(node)) && hasArabicScript(node) && !isNodeEditable(node)
    }
}

const NeverPlugin: WudoohPlugin = {
    id: "NeverPlugin",
    urlRequiresUpdate(url: URL): boolean {return false},
    requiresUpdate(node: Node): boolean {return false}
}

const AlwaysPlugin: WudoohPlugin = {
    id: "AlwaysPlugin",
    urlRequiresUpdate(url: URL): boolean {return true},
    requiresUpdate(node: Node): boolean {return false}
}

const wudoohPlugins: Array<WudoohPlugin> = [YoutubePlugin, NeverPlugin, AlwaysPlugin]