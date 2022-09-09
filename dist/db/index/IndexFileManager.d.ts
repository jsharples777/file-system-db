import { DBConfig, IndexContent, IndexVersion } from "../Types";
import { Configurable } from "../Configurable";
import { Index } from "./Index";
export declare class IndexFileManager implements Configurable {
    private static _instance;
    static getInstance(): IndexFileManager;
    private config;
    private fileQueueInterval;
    private fileWriteQueue;
    private isProcessingQueue;
    private constructor();
    loadConfig(config: DBConfig): void;
    writeIndexFile(index: Index): void;
    writeIndex(version: IndexVersion, content: IndexContent): void;
    readIndex(collection: string, name: string): {
        version: IndexVersion;
        content: IndexContent;
    };
    protected processFileQueue(): void;
}
