import { Collection } from "./collection/Collection";
export declare class DB {
    private static _instance;
    static getInstance(): DB;
    static copyObject(object: any): any;
    private isInitialised;
    private constructor();
    initialise(): DB;
    collections(): string[];
    getCollection(name: string): Collection;
}
