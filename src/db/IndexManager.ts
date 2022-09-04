import debug from 'debug';
import {Configurable} from "./Configurable";
import {DBConfig, Index, IndexConfig, IndexEntry, IndexVersion} from "./Types";
import * as fs from "fs";
import {CollectionManager} from "./CollectionManager";

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
    private indexVersions: IndexVersion[] = [];

    private constructor() {
    }

    private setupIndex(name: string, collectionName: string): IndexVersion {
        logger(`Setting up index ${name}`);
        let result: IndexVersion = {
            version: 1,
            name: name,
            collection: collectionName
        }

        const indexFileName = `${this.config?.dbLocation}/${collectionName}/${name}.idx`;
        if (!fs.existsSync(indexFileName)) {
            logger(`Creating empty index file for index ${name} at ${indexFileName}`);
            const indexContent: Index = {
                version: 1,
                entries: []
            }
            fs.writeFileSync(indexFileName, JSON.stringify(indexContent));
        }
        const indexVersionFileName = `${this.config?.dbLocation}/${collectionName}/${name}.vrs`;
        if (!fs.existsSync(indexVersionFileName)) {
            logger(`Setting up index version file for index ${name} at ${indexVersionFileName}`);
            fs.writeFileSync(indexFileName, JSON.stringify(result));
        } else {
            const buffer = fs.readFileSync(indexVersionFileName);
            logger(`Setting up index ${name} - loading existing version file`);
            result = <IndexVersion>JSON.parse(buffer.toString());
        }

        logger(result);
        return result;
    }

    protected getFieldValue(entry: any, field: string): any | undefined {
        let result: any | undefined = undefined;
        // any dot notation?
        const fieldParts = field.split('.');
        if (fieldParts.length > 1) {
            let previousValue = entry;
            fieldParts.forEach((fieldPart, index) => {
                if (previousValue) {
                    previousValue = previousValue[fieldPart];
                    if (index === (fieldParts.length - 1)) {
                        if (previousValue) {
                            result = previousValue;
                        }
                    }
                }
            });

        } else {
            result = entry[field];
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


    protected getIndexConfigByCollection(name: string): IndexConfig | null {
        let result: IndexConfig | null = null;
        if (this.config) {
            const foundIndex = this.config.indexes.findIndex((index) => index.name === name);
            if (foundIndex >= 0) {
                result = this.config.indexes[foundIndex];
            }
        }

        return result;
    }

    protected rebuildIndex(version: IndexVersion): void {
        if (this.config) {
            const collection = CollectionManager.getInstance().getCollection(version.collection);
            const indexContent: Index = {
                version: collection.getVersion(),
                entries: []
            }
            const entries = collection.find();
            entries.forEach((entry) => {
                const indexConfig = this.getIndexConfig(version.name);
                if (indexConfig) {
                    const indexEntry: IndexEntry = {
                        keyValue: entry._id,
                        fieldValues: []
                    }
                    // find each field for index config
                    indexConfig.fields.forEach((field => {
                        const fieldValue = this.getFieldValue(entry, field);
                        if (fieldValue) {
                            indexEntry.fieldValues.push({
                                field: field,
                                value: fieldValue
                            });
                        }
                    }));
                    indexContent.entries.push(indexEntry);
                }
            });
        }
    }

    loadConfig(config: DBConfig): void {
        this.config = config;
        // check on each index file
        this.config.indexes.forEach((index) => {
            const version = this.setupIndex(index.name, index.collection);
            this.indexVersions.push(version);
            // check version sync for collection
            logger(`Checking index ${index.name} sync for collection ${index.collection}`);
            const collection = CollectionManager.getInstance().getCollection(index.collection);
            if (collection.getVersion() !== version.version) {
                // rebuild index
                logger(`index ${index.name} mismatch with collection ${index.collection} - ${collection.getVersion()} vs ${version.version}`);
                this.rebuildIndex(version);
            }
        });
    }

    entryInserted(collection: string, keyValue: string, version:number, values: any): void {

    }

    entryUpdated(collection: string, keyValue: string, version:number, values: any): void {

    }

    entryDeleted(collection: string, keyValue: string, version:number ): void {

    }

}
