import debug from 'debug';
import {Configurable} from "../Configurable";
import {DBConfig, IndexConfig} from "../Types";
import {Index} from "./Index";
import {IndexImplementation} from "./IndexImplementation";
import {SearchItem} from "../search/SearchTypes";


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

    public getMatchingIndex(collection:string,search:SearchItem[]):Index|null {
        logger(`Looking for index for collection ${collection} for search criteria`);
        logger(search);

        let result:Index|null = null;
        // look for full matches first
        this.indexes.every((index) => {
            if (collection === index.getCollection()) { // matches collection
                const fullMatch = index.matchesFilter(search);
                if (fullMatch) {
                    logger(`Looking for index for collection ${collection} for search criteria, found full match index ${index.getName()}`);
                    result = index;
                    return false;
                }
            }
            return true;
        });

        if (!result) {
            // look for partial matches next
            this.indexes.every((index) => {
                if (collection === index.getCollection()) { // matches collection
                    const match = index.partiallyMatchesFilter(search);
                    if (match) {
                        logger(`Looking for index for collection ${collection} for search criteria, found partial match index ${index.getName()}`);
                        result = index;
                        return false;
                    }
                }
                return true;
            });
        }
        return result;
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
        logger(`Loading index configurations`);
        this.config = config;
        const rebuildIndexes = ((process.env.REBUILD_INDEXES_ON_STARTUP || 'N') === 'Y');
        logger(`Will rebuild indexes? ${rebuildIndexes}`);
        if (this.config) {
            const dbLocation = this.config.dbLocation;
            // check on each index file
            this.config.indexes.forEach((indexConfig) => {
                const index = new IndexImplementation(dbLocation,indexConfig);
                if (rebuildIndexes) index.rebuild();
                this.indexes.push(index);
            });
        }
    }

    entryInserted(collection: string, keyValue: string, version:number, values: any): void {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    logger(`Adding entry for index ${index.getName()} for collection ${collection} with key ${keyValue}`);
                    index.objectAdded(version,keyValue,values);
                }
            });
        }

    }

    entryUpdated(collection: string, keyValue: string, version:number, values: any): void {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    logger(`Updating entry for index ${index.getName()} for collection ${collection} with key ${keyValue}`);
                    index.objectUpdated(version,keyValue,values);
                }
            });
        }
    }

    entryDeleted(collection: string, keyValue: string, version:number ): void {
        if (this.config) {
            this.indexes.forEach((index) => {
                if (index.getCollection() === collection) {
                    logger(`Removing entry for index ${index.getName()} for collection ${collection} with key ${keyValue}`);
                    index.objectRemoved(version,keyValue);
                }
            });
        }
    }

}
