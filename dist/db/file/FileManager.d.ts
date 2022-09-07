import { DBConfig } from "../Types";
import { Configurable } from "../Configurable";
export declare class FileManager implements Configurable {
    private static _instance;
    static getInstance(): FileManager;
    private config;
    private fileQueueInterval;
    private fileWriteQueue;
    private isProcessingQueue;
    private constructor();
    loadConfig(config: DBConfig): void;
    isDuplicateKey(collection: string, key: string): boolean;
    writeDataObjectFile(collection: string, key: string, object: any): void;
    readDataObjectFile(collection: string, key: string): any | null;
    protected writeDataObjectFileContent(collection: string, key: string, object: any): void;
    removeDataObjectFile(collection: string, key: string): boolean;
    protected processFileQueue(): void;
    readEntireCollection(collection: string): any[];
}
