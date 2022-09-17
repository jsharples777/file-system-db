import { CollectionConfig, DBConfig } from "../config/Types";
import { Configurable } from "../config/Configurable";
import { Collection } from "./Collection";
import { Life } from "../life/Life";
import { CollectionListener } from "./CollectionListener";
import { DatabaseManagers } from "../DatabaseManagers";
export declare enum CollectionFileQueueEntryOperation {
    write = 1,
    delete = -1
}
export declare type FileQueueEntry = {
    config: CollectionConfig;
    collection: string;
    key: string;
    object: any;
    operation: CollectionFileQueueEntryOperation;
};
export declare class CollectionFileManager implements Configurable, Life, CollectionListener {
    private config;
    private fileQueueInterval;
    private fileWriteQueue;
    private isProcessingQueue;
    private managers;
    constructor(managers: DatabaseManagers);
    loadConfig(config: DBConfig): void;
    isDuplicateKey(collection: string, key: string): boolean;
    writeDataObjectFile(config: CollectionConfig, collection: string, key: string, object: any, checkForDuplicateKey: boolean): void;
    addFileEntry(entry: FileQueueEntry): void;
    addFileEntries(entries: FileQueueEntry[]): void;
    removeDataObjectFile(config: CollectionConfig, collection: string, key: string): void;
    readDataObjectFile(collection: string, key: string): any | null;
    checkWriteQueueForDataObject(collection: string, key: string): any | null;
    readCollectionConfig(collectionConfig: CollectionConfig): CollectionConfig;
    readEntireCollection(collectionConfig: CollectionConfig): {
        config: CollectionConfig;
        content: any[];
    };
    die(): void;
    getBPM(): number;
    heartbeat(): void;
    isAlive(): boolean;
    getName(): string;
    birth(): void;
    objectAdded(collection: Collection, key: string, object: any): void;
    objectRemoved(collection: Collection, key: string): void;
    objectUpdated(collection: Collection, key: string, object: any): void;
    protected writeCollectionConfig(config: CollectionConfig): void;
    protected writeDataObjectFileContent(config: CollectionConfig, collection: string, key: string, object: any): void;
    protected removeDataObjectFileContent(config: CollectionConfig, collection: string, key: string): boolean;
    protected processFileQueue(): void;
}
