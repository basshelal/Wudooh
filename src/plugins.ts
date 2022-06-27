type WudoohNodeModificationReason = "added" | "removed" | "dataChanged" | "unknown"

type MaybePromise<T> = T | Promise<T>

interface WudoohPlugin {
    /** Unique identifier or name of plugin, this is required */
    readonly id: string
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

    /**
     * Return `true` for updates to proceed on this document
     * otherwise, no further callbacks will be made. This is called once
     * This is required
     */
    readonly urlRequiresUpdate: (url: URL) => MaybePromise<boolean>
    /**
     * Called before a single loop of multiple {@link update} calls,
     * use this to set up any state or expensive computation (such as getting values from storage
     * which will not change often) before the update loop
     */
    readonly beforeUpdateAll?: () => MaybePromise<void>
    /**
     * The function that updates the node
     */
    readonly update?: (node: Node, modificationReason: WudoohNodeModificationReason) => MaybePromise<void>
    /**
     * Called after a single loop of multiple {@link update} calls,
     * the equivalent of {@link beforeUpdateAll}.
     * Use this for any clean up required after {@link beforeUpdateAll}
     */
    readonly afterUpdateAll?: () => MaybePromise<void>
}

class AbstractWudoohPlugin {
    public hasNodeUpdated(node: Node): boolean {return hasNodeBeenUpdated(node)}
}

const DefaultPlugin = new (class DefaultPlugin extends AbstractWudoohPlugin implements WudoohPlugin {
    /*override*/
    public id: string = "DefaultPlugin"

    /*override*/
    public isExclusivePlugin: boolean = false

    /** Hostname of current URL, set in {@link urlRequiresUpdate} */
    private urlHostname!: string
    /** The {@link WudoohStorage} first fetched in {@link beforeUpdateAll} */
    private storage!: WudoohStorage
    /** The {@link CustomSetting} of this site, if it exists, `undefined` otherwise */
    private customSetting?: CustomSetting | undefined

    /*override*/
    public async urlRequiresUpdate(url: URL): Promise<boolean> {
        // true only if Wudooh is on and this url is not whitelisted
        this.urlHostname = url.hostname
        this.storage = await sync.get(WudoohKeys.all())
        return (!!this.storage.onOff && this.storage.onOff) &&
            (!!this.storage.whitelisted && !this.storage.whitelisted.contains(this.urlHostname))
    }

    /*override*/
    public async beforeUpdateAll(): Promise<void> {
        this.customSetting = this.storage.customSettings ?
            this.storage.customSettings.find((custom: CustomSetting) => custom.url === this.urlHostname) : undefined
        if (!!this.storage.customFonts) {
            injectCustomFonts(this.storage.customFonts)
        }
    }

    /*override*/
    public update(node: Node,
                  modificationReason: WudoohNodeModificationReason): void {
        if (!this.hasNodeUpdated(node) && hasArabicScript(node) && !isNodeEditable(node)) {
            console.log("Update called at: " + Date.now())
        }
    }

    /*override*/
    public afterUpdateAll(): void {

    }

    public notifyNodeUpdated(node: Node): void {
        // TODO: Mark node as updated and hasNodeUpdated should return true for this node, no more updates
    }
})()

const YoutubePlugin = new (class YoutubePlugin extends AbstractWudoohPlugin implements WudoohPlugin {
    /*override*/
    public id: string = "YoutubePlugin"
    /*override*/
    public isExclusivePlugin: boolean = true

    /*override*/
    public urlRequiresUpdate(url: URL): boolean {
        return url.hostname === "youtube.com" || url.hostname === "www.youtube.com"
    }

    public requiresUpdate(node: Node): boolean {
        return (!!this.hasNodeUpdated && !this.hasNodeUpdated(node)) && hasArabicScript(node) && !isNodeEditable(node)
    }
})()

const NeverPlugin: WudoohPlugin = {
    id: "NeverPlugin",
    urlRequiresUpdate(url: URL): boolean {return false}
}

const AlwaysPlugin: WudoohPlugin = {
    id: "AlwaysPlugin",
    urlRequiresUpdate(url: URL): boolean {return true}
}

const wudoohPlugins: Array<WudoohPlugin> = [YoutubePlugin, NeverPlugin, AlwaysPlugin]