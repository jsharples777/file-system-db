"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManagers = void 0;
const ConfigManager_1 = require("./config/ConfigManager");
const CollectionFileManager_1 = require("./collection/CollectionFileManager");
const CollectionManager_1 = require("./collection/CollectionManager");
const IndexFileManager_1 = require("./index/IndexFileManager");
const IndexManager_1 = require("./index/IndexManager");
const LifeCycleManager_1 = require("./life/LifeCycleManager");
class DatabaseManagers {
    constructor(configLocation) {
        let cfgLocation = process.env.FILE_SYSTEM_DB_CONFIG || 'cfg/config.json';
        if (configLocation) {
            cfgLocation = configLocation;
        }
        const config = new ConfigManager_1.ConfigManager().loadConfig(cfgLocation);
        this.lifecycleManger = new LifeCycleManager_1.LifeCycleManager();
        this.collectionFileManager = new CollectionFileManager_1.CollectionFileManager();
        this.collectionFileManager.loadConfig(config);
        this.collectionManager = new CollectionManager_1.CollectionManager(this);
        this.collectionManager.loadConfig(config);
        this.indexFileManager = new IndexFileManager_1.IndexFileManager();
        this.indexFileManager.loadConfig(config);
        this.indexManager = new IndexManager_1.IndexManager(this);
        this.indexManager.loadConfig(config);
        this.lifecycleManger.addLife(this.collectionFileManager);
        this.lifecycleManger.addLife(this.indexFileManager);
        this.lifecycleManger.birth();
    }
    getCollectionManager() {
        return this.collectionManager;
    }
    getCollectionFileManager() {
        return this.collectionFileManager;
    }
    getIndexManager() {
        return this.indexManager;
    }
    getIndexFileManager() {
        return this.indexFileManager;
    }
    getLifecycleManager() {
        return this.lifecycleManger;
    }
}
exports.DatabaseManagers = DatabaseManagers;
//# sourceMappingURL=DatabaseManagers.js.map