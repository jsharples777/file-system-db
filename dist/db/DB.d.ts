import { Collection } from "./collection/Collection";
import { SearchItem } from "./search/SearchTypes";
import { SortOrderItem } from "./sort/SortTypes";
import { ObjectView } from "./view/ObjectView";
export declare class DB {
    private static _instance;
    static getInstance(): DB;
    private isInitialised;
    private views;
    private constructor();
    initialise(): DB;
    collections(): string[];
    collection(name: string): Collection;
    protected shutdown(): void;
    addView(collection: string, name: string, fields: string[], search?: SearchItem[], sort?: SortOrderItem[]): ObjectView;
    getView(name: string): ObjectView | null;
}
