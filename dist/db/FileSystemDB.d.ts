import { Collection } from "./collection/Collection";
import { SearchItem } from "./search/SearchTypes";
import { SortOrderItem } from "./sort/SortTypes";
import { ObjectView } from "./view/ObjectView";
export declare class FileSystemDB {
    private static _instance;
    private managers;
    static getInstance(configLocation?: string): FileSystemDB;
    private isInitialised;
    private configLocation?;
    private views;
    constructor(configLocation?: string);
    initialise(): FileSystemDB;
    collections(): string[];
    collection(name: string): Collection;
    shutdown(): void;
    addView(collection: string, name: string, fields: string[], search?: SearchItem[], sort?: SortOrderItem[]): ObjectView;
    getView(name: string): ObjectView | null;
}
