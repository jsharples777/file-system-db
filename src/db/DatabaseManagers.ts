import {ConfigManager} from "./config/ConfigManager";
import {CollectionFileManager} from "./collection/CollectionFileManager";
import {CollectionManager} from "./collection/CollectionManager";
import {IndexFileManager} from "./index/IndexFileManager";
import {IndexManager} from "./index/IndexManager";
import {LifeCycleManager} from "./life/LifeCycleManager";

export class DatabaseManagers {
    private collectionFileManager: CollectionFileManager;
    private collectionManager: CollectionManager;
    private indexFileManager: IndexFileManager;
    private indexManager: IndexManager;
    private lifecycleManger: LifeCycleManager;

    constructor(configLocation?: string) {
        let cfgLocation = process.env.FILE_SYSTEM_DB_CONFIG || 'cfg/config.json';
        if (configLocation) {
            cfgLocation = configLocation;
        }
        const config = new ConfigManager().loadConfig(cfgLocation);
        this.lifecycleManger = new LifeCycleManager();
        this.collectionFileManager = new CollectionFileManager();
        this.collectionFileManager.loadConfig(config);
        this.collectionManager = new CollectionManager(this);
        this.collectionManager.loadConfig(config);
        this.indexFileManager = new IndexFileManager();
        this.indexFileManager.loadConfig(config);
        this.indexManager = new IndexManager(this);
        this.indexManager.loadConfig(config);

        this.lifecycleManger.addLife(this.collectionFileManager);
        this.lifecycleManger.addLife(this.indexFileManager);
        this.lifecycleManger.birth();
    }

    getCollectionManager(): CollectionManager {
        return this.collectionManager;
    }

    getCollectionFileManager(): CollectionFileManager {
        return this.collectionFileManager;
    }

    getIndexManager(): IndexManager {
        return this.indexManager;
    }

    getIndexFileManager(): IndexFileManager {
        return this.indexFileManager;
    }

    getLifecycleManager(): LifeCycleManager {
        return this.lifecycleManger;
    }


}
