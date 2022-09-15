import { Collection } from "./collection/Collection";
import { SearchItem } from "./search/SearchTypes";
import { SortOrderItem } from "./sort/SortTypes";
import { View } from "./view/View";
export declare class FileSystemDB {
    private static _instance;
    private managers;
    private isInitialised;
    private configLocation?;
    private views;
    constructor(configLocation?: string);
    static getInstance(configLocation?: string): FileSystemDB;
    initialise(): FileSystemDB;
    collections(): string[];
    collection(name: string): Collection;
    shutdown(): void;
    addView(collection: string, name: string, fields: string[], search?: SearchItem[], sort?: SortOrderItem[]): View;
    getView(name: string): View | null;
    logChanges(logFileLocation?: string): void;
    isLoggingChanges(): boolean;
    applyChangeLog(logFileLocation?: string): void;
    addReplicationLocation(replicateToDir: string): void;
    startReplication(): void;
    stopReplication(): void;
}
