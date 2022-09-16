"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManagers = void 0;
const ConfigManager_1 = require("./config/ConfigManager");
const CollectionFileManager_1 = require("./collection/CollectionFileManager");
const CollectionManager_1 = require("./collection/CollectionManager");
const IndexFileManager_1 = require("./index/IndexFileManager");
const IndexManager_1 = require("./index/IndexManager");
const LifeCycleManager_1 = require("./life/LifeCycleManager");
const LogFileManager_1 = require("./log/LogFileManager");
class DatabaseManagers {
    constructor(db, configLocation) {
        this.db = db;
        let cfgLocation = process.env.FILE_SYSTEM_DB_CONFIG || 'cfg/config.json';
        if (configLocation) {
            cfgLocation = configLocation;
        }
        const config = new ConfigManager_1.ConfigManager().loadConfig(cfgLocation);
        this.lifecycleManger = new LifeCycleManager_1.LifeCycleManager();
        this.collectionFileManager = new CollectionFileManager_1.CollectionFileManager(this);
        this.collectionFileManager.loadConfig(config);
        this.collectionManager = new CollectionManager_1.CollectionManager(this);
        this.collectionManager.loadConfig(config);
        this.indexFileManager = new IndexFileManager_1.IndexFileManager();
        this.indexFileManager.loadConfig(config);
        this.indexManager = new IndexManager_1.IndexManager(this);
        this.indexManager.loadConfig(config);
        this.logFileManager = new LogFileManager_1.LogFileManager(this);
        if (db.isLoggingChanges()) {
            this.lifecycleManger.addLife(this.logFileManager);
        }
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
    getDB() {
        return this.db;
    }
    getLogFileManager() {
        return this.logFileManager;
    }
}
exports.DatabaseManagers = DatabaseManagers;
//# sourceMappingURL=DatabaseManagers.js.map