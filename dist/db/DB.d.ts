import { Collection } from "./collection/Collection";
import { SearchItem } from "./search/SearchTypes";
import { SortOrderItem } from "./sort/SortTypes";
import { ObjectView } from "./view/ObjectView";
export declare class DB {
    private static _instance;
    static getInstance(): DB;
    static copyObject(object: any): any;
    static getFieldValue(entry: any, field: string): any | undefined;
    private isInitialised;
    private constructor();
    initialise(): DB;
    collections(): string[];
    collection(name: string): Collection;
    protected shutdown(): void;
    addView(collection: string, fields: string[], search?: SearchItem[], sort?: SortOrderItem[]): ObjectView;
}
