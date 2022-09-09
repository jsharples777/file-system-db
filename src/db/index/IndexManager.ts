import debug from 'debug';
import {Configurable} from "../Configurable";
import {DBConfig, IndexConfig} from "../Types";
import {Index} from "./Index";
import {IndexImplementation} from "./IndexImplementation";


const logger = debug('index-manager');

export class IndexManager implements Configurable {
    private static _instance: IndexManager;

    public static getInstance(): IndexManager {
        if (!IndexManager._instance) {
            IndexManager._instance = new IndexManager();
        }
        return IndexManager._instance;
    }

    private config: DBConfig | undefined;
    private indexes:Index[] = [];

    private constructor() {
    }





    protected getIndexConfig(name: string): IndexConfig | null {
        let result: IndexConfig | null = null;
        if (this.config) {
            const foundIndex = this.config.indexes.findIndex((index) => index.name === name);
            if (foundIndex >= 0) {
                result = this.config.indexes[foundIndex];
            }
        }

        return result;
    }

    loadConfig(config: DBConfig): void {
        this.config = config;
        if (this.config) {
            const dbLocation = this.config.dbLocation;
            // check on each index file
            this.config.indexes.forEach((indexConfig) => {
                const index = new IndexImplementation(dbLocation,indexConfig);
                this.indexes.push(index);
            });
        }
    }

    entryInserted(collection: string, keyValue: string, version:number, values: any): void {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    index.objectAdded(version,keyValue,values);
                }
            });
        }

    }

    entryUpdated(collection: string, keyValue: string, version:number, values: any): void {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    index.objectUpdated(version,keyValue,values);
                }
            });
        }
    }

    entryDeleted(collection: string, keyValue: string, version:number ): void {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    index.objectRemoved(version,keyValue);
                }
            });
        }
    }

}
