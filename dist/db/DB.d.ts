import { Collection } from "./Collection";
export declare class DB {
    private static _instance;
    static getInstance(): DB;
    private isInitialised;
    private constructor();
    initialise(): DB;
    collections(): string[];
    getCollection(name: string): Collection;
}
