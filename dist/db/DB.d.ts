import { Collection } from "./collection/Collection";
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
}
