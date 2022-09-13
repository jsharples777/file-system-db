import { DBConfig, IndexContent, IndexVersion } from "../config/Types";
import { Configurable } from "../config/Configurable";
import { Index } from "./Index";
import { Life } from "../life/Life";
export declare class IndexFileManager implements Configurable, Life {
    private config;
    private fileQueueInterval;
    private fileWriteQueue;
    private isProcessingQueue;
    constructor();
    loadConfig(config: DBConfig): void;
    writeIndexFile(index: Index): void;
    writeIndex(version: IndexVersion, content: IndexContent): void;
    readIndex(collection: string, name: string): {
        version: IndexVersion;
        content: IndexContent;
    };
    protected processFileQueue(): void;
    die(): void;
    getBPM(): number;
    heartbeat(): void;
    isAlive(): boolean;
    getName(): string;
    birth(): void;
}
