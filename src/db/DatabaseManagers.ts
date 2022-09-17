import {ConfigManager} from "./config/ConfigManager";
import {CollectionFileManager} from "./collection/CollectionFileManager";
import {CollectionManager} from "./collection/CollectionManager";
import {IndexFileManager} from "./index/IndexFileManager";
import {IndexManager} from "./index/IndexManager";
import {LifeCycleManager} from "./life/LifeCycleManager";
import {FileSystemDB} from "./FileSystemDB";
import {LogFileManager} from "./log/LogFileManager";
import {DBConfig} from "./config/Types";

export class DatabaseManagers {
    private collectionFileManager: CollectionFileManager;
    private collectionManager: CollectionManager;
    private indexFileManager: IndexFileManager;
    private indexManager: IndexManager;
    private lifecycleManger: LifeCycleManager;
    private db: FileSystemDB;
    private logFileManager: LogFileManager;
    private config:DBConfig;

    constructor(db: FileSystemDB, configLocation?: string,overrideDBDir?:string) {
        this.db = db;
        let cfgLocation = process.env.FILE_SYSTEM_DB_CONFIG || 'cfg/config.json';
        if (configLocation) {
            cfgLocation = configLocation;
        }

        this.config = new ConfigManager().loadConfig(cfgLocation);
        if (overrideDBDir) {
            this.config.dbLocation = overrideDBDir;
        }
        this.lifecycleManger = new LifeCycleManager();
        this.collectionFileManager = new CollectionFileManager(this);
        this.collectionFileManager.loadConfig(this.config);
        this.collectionManager = new CollectionManager(this);
        this.collectionManager.loadConfig(this.config);
        this.indexFileManager = new IndexFileManager();
        this.indexFileManager.loadConfig(this.config);
        this.indexManager = new IndexManager(this);
        this.indexManager.loadConfig(this.config);
        this.logFileManager = new LogFileManager(this);


        if (db.isLoggingChanges()) {
            this.lifecycleManger.addLife(this.logFileManager);
        }

        this.lifecycleManger.addLife(this.collectionFileManager);
        this.lifecycleManger.addLife(this.indexFileManager);
        this.lifecycleManger.birth();
    }

    getConfig():DBConfig {
        return this.config;
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

    getDB(): FileSystemDB {
        return this.db;
    }

    getLogFileManager(): LogFileManager {
        return this.logFileManager;
    }


}
