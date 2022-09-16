import { Life } from "../life/Life";
import { FileQueueEntry } from "../collection/CollectionFileManager";
import { DatabaseManagers } from "../DatabaseManagers";
export declare class LogFileManager implements Life {
    private logLocation;
    private fileQueueInterval;
    private fileWriteQueue;
    private isProcessingQueue;
    private bIsAlive;
    private managers;
    constructor(managers: DatabaseManagers);
    die(): void;
    getBPM(): number;
    heartbeat(): void;
    isAlive(): boolean;
    getName(): string;
    birth(): void;
    setLogLocation(logLocation: string): void;
    addOperation(entry: FileQueueEntry): void;
    loadLogFile(logFileLocation: string): void;
    protected processFileQueue(): void;
}
