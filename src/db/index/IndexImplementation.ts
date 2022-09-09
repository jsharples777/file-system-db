import {Index} from "./Index";
import {IndexConfig, IndexContent, IndexEntry, IndexVersion, SearchFilter} from "../Types";
import {CollectionManager} from "../collection/CollectionManager";
import fs from "fs";
import debug from 'debug';
import {DB} from "../DB";
import {IndexFileManager} from "./IndexFileManager";
import {IndexManager} from "./IndexManager";

const logger = debug('index-implementation');

export class IndexImplementation implements Index {
    private config: IndexConfig;
    private dbLocation: string;
    private version:IndexVersion;
    private content:IndexContent;
    private indexLoaded:boolean = false;
    private indexInUse:boolean = false;
    private defaultLifespan: number;


    constructor(dbLocation:string, config:IndexConfig) {
        this.dbLocation = dbLocation;
        this.config = config;
        this.version = {
            version:1,
            name:this.config.name,
            collection:this.config.collection
        };
        this.content = {
            version:1,
            entries:[]
        };

        this.defaultLifespan = parseInt(process.env.DEFAULT_INDEX_LIFESPAN_SEC || '600');
        if (isNaN(this.defaultLifespan)) {
            this.defaultLifespan = 600;
        }

        this.checkIndexUse = this.checkIndexUse.bind(this);

        setInterval(() => {
            this.checkIndexUse();
        },this.defaultLifespan/2*1000);

    }

    protected checkIndexUse():void {
        if (this.indexInUse) {
            this.indexInUse = false;
        }
        else {
            if (this.indexLoaded) this.removeIndexBuffer();
        }
    }

    protected removeIndexBuffer():void {
        logger(`Index hasn't been used in ${this.defaultLifespan} seconds, removing buffer`);
        this.content.entries = [];
        this.indexLoaded = false;
        this.indexInUse = false;
    }




    findMatchingKeys(searchFilter: SearchFilter): string[] {
        this.checkIndexLoaded();
        return [];
    }

    getCollection(): string {
        return this.config.collection+'';
    }

    protected checkIndexLoaded():void {
        if (!this.indexLoaded) {
            const result = IndexFileManager.getInstance().readIndex(this.config.collection,this.config.name);
            this.version = result.version;
            this.content = result.content;
            this.indexLoaded = true;
        }
        this.indexInUse = true;
    }

    getEntries(): IndexEntry[] {
        this.checkIndexLoaded();
        return this.content.entries;
    }

    getFields(): string[] {
        return DB.copyObject(this.config.fields);
    }

    getIndexContent(): IndexContent {
        this.checkIndexLoaded();
        return this.content;
    }

    getIndexVersion(): IndexVersion {
        this.checkIndexLoaded();
        return this.version;
    }

    getName(): string {
        return this.config.name+'';
    }

    getVersion(): number {
        this.checkIndexLoaded();
        return this.version.version;
    }

    matchesFilter(searchFilter: SearchFilter): boolean {
        return false;
    }

    objectAdded(version:number, key: string, object: any): void {
        this.checkIndexLoaded();
        logger(`Creating new index entry for ${key}`);
        this.content.entries.push(object);
        this.version.version = version;
        IndexFileManager.getInstance().writeIndexFile(this);
    }

    objectRemoved(version:number, key: string): void {
        this.checkIndexLoaded();
        const foundIndex = this.content.entries.findIndex((entry) => entry.keyValue === key);
        if (foundIndex >= 0) {
            logger(`Removing index entry for ${key}`);
            this.content.entries.splice(foundIndex,1);
        }
        this.version.version = version;
        IndexFileManager.getInstance().writeIndexFile(this);
    }

    private constructIndexEntry(key:string, object:any):IndexEntry {
        const indexEntry: IndexEntry = {
            keyValue: key,
            fieldValues: []
        }
        // find each field for index config
        this.config.fields.forEach((field => {
            const fieldValue = this.getFieldValue(object, field);
            if (fieldValue) {
                indexEntry.fieldValues.push({
                    field: field,
                    value: fieldValue
                });
            }
        }));
        return indexEntry;
    }

    objectUpdated(version:number, key: string, object: any): void {
        this.checkIndexLoaded();
        const foundIndex = this.content.entries.findIndex((entry) => entry.keyValue === key);
        if (foundIndex >= 0) {
            logger(`Updating index entry for ${key}`);
            const newEntry = this.constructIndexEntry(key, object);
            this.content.entries.splice(foundIndex,1,newEntry);
        }
        this.version.version = version;
        IndexFileManager.getInstance().writeIndexFile(this);

    }

    setVersion(version: number): void {
        this.checkIndexLoaded();
        this.version.version = version;
    }

    protected rebuildIndex(version: IndexVersion): void {
        if (this.config) {
            const collection = CollectionManager.getInstance().getCollection(version.collection);
            const versionNumber = collection.getVersion();
            const indexContent: IndexContent = {
                version: versionNumber,
                entries: []
            }
            const entries = collection.find();
            entries.forEach((entry) => {
                    const indexEntry: IndexEntry = {
                        keyValue: entry._id,
                        fieldValues: []
                    }
                    // find each field for index config
                    this.config.fields.forEach((field => {
                        const fieldValue = this.getFieldValue(entry, field);
                        if (fieldValue) {
                            indexEntry.fieldValues.push({
                                field: field,
                                value: fieldValue
                            });
                        }
                    }));
                    indexContent.entries.push(indexEntry);
            });
        }
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



}
