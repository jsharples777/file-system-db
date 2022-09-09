import { CollectionConfig, DBConfig } from "../Types";
import { Configurable } from "../Configurable";
export declare class CollectionFileManager implements Configurable {
    private static _instance;
    static getInstance(): CollectionFileManager;
    private config;
    private fileQueueInterval;
    private fileWriteQueue;
    private isProcessingQueue;
    private constructor();
    loadConfig(config: DBConfig): void;
    isDuplicateKey(collection: string, key: string): boolean;
    writeDataObjectFile(config: CollectionConfig, collection: string, key: string, object: any, checkForDuplicateKey: boolean): void;
    removeDataObjectFile(config: CollectionConfig, collection: string, key: string): void;
    readDataObjectFile(collection: string, key: string): any | null;
    protected writeCollectionConfig(config: CollectionConfig): void;
    protected writeDataObjectFileContent(config: CollectionConfig, collection: string, key: string, object: any): void;
    protected removeDataObjectFileContent(config: CollectionConfig, collection: string, key: string): boolean;
    protected processFileQueue(): void;
    checkWriteQueueForDataObject(collection: string, key: string): any | null;
    readCollectionConfig(collectionConfig: CollectionConfig): CollectionConfig;
    readEntireCollection(collectionConfig: CollectionConfig): {
        config: CollectionConfig;
        content: any[];
    };
}
