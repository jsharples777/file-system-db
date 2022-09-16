import { CollectionFileManager } from "./collection/CollectionFileManager";
import { CollectionManager } from "./collection/CollectionManager";
import { IndexFileManager } from "./index/IndexFileManager";
import { IndexManager } from "./index/IndexManager";
import { LifeCycleManager } from "./life/LifeCycleManager";
import { FileSystemDB } from "./FileSystemDB";
import { LogFileManager } from "./log/LogFileManager";
export declare class DatabaseManagers {
    private collectionFileManager;
    private collectionManager;
    private indexFileManager;
    private indexManager;
    private lifecycleManger;
    private db;
    private logFileManager;
    constructor(db: FileSystemDB, configLocation?: string);
    getCollectionManager(): CollectionManager;
    getCollectionFileManager(): CollectionFileManager;
    getIndexManager(): IndexManager;
    getIndexFileManager(): IndexFileManager;
    getLifecycleManager(): LifeCycleManager;
    getDB(): FileSystemDB;
    getLogFileManager(): LogFileManager;
}
