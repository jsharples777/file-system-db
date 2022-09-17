import {Collection, KeyObjectPair} from "./Collection";
import {CollectionConfig, OperationResult} from "../config/Types";
import {ObjectBuffer} from "../buffer/ObjectBuffer";
import {BufferFactory} from "../buffer/BufferFactory";
import debug from 'debug';
import {Compare, SearchItem} from "../search/SearchTypes";
import {SearchProcessor} from "../search/SearchProcessor";
import {CursorImpl} from "../cursor/CursorImpl";
import {Cursor} from "../cursor/Cursor";
import {CollectionListener} from "./CollectionListener";
import {Util} from "../util/Util";
import {DatabaseManagers} from "../DatabaseManagers";
import {Query} from "../query/Query";
import {QueryImpl} from "../query/QueryImpl";
import {SortOrderItem} from "../sort/SortTypes";

const logger = debug('collection-implementation');


export class CollectionImpl implements Collection {
    private config: CollectionConfig;
    private buffer: ObjectBuffer;
    private listeners: CollectionListener[] = [];
    private managers: DatabaseManagers;

    constructor(config: CollectionConfig, managers: DatabaseManagers) {
        this.config = config;
        this.managers = managers;
        this.buffer = BufferFactory.getInstance().createBuffer(config, this.managers.getLifecycleManager());
        if (this.buffer.isComplete()) {
            logger(`Collection ${this.config.name} - buffer is complete - loading all`);
            // load all content
            const contentAndConfig = this.managers.getCollectionFileManager().readEntireCollection(this.config);
            this.buffer.initialise(contentAndConfig.content);
            logger(`Collection ${this.config.name} - loaded ${contentAndConfig.content.length} entries`);
            this.config = contentAndConfig.config;
        } else {
            logger(`Collection ${this.config.name} - buffer is not complete - loading config`);
            this.config = this.managers.getCollectionFileManager().readCollectionConfig(this.config);
        }
    }

    getConfig(): CollectionConfig {
        return Util.copyObject(this.config);
    }

    findByKey(key: string) {
        logger(`Collection ${this.config.name} - find by key ${key}`);
        let result: any | null = null;
        if (this.buffer.hasKey(key)) {
            logger(`Collection ${this.config.name} - find by key ${key} - found in buffer`);
            result = this.buffer.getObject(key);
        } else {
            // object could still be in write queue
            result = this.managers.getCollectionFileManager().checkWriteQueueForDataObject(this.config.name, key);
            if (result) {
                logger(`Collection ${this.config.name} - find by key ${key} - found in file manager write queue`);
            } else {
                logger(`Collection ${this.config.name} - find by key ${key} - trying to load from file`);
                result = this.managers.getCollectionFileManager().readDataObjectFile(this.config.name, key);
                if (result) {
                    logger(`Collection ${this.config.name} - find by key ${key} - found in file`);
                    this.buffer.addObject(key, result);
                }


            }
        }
        return result;
    }

    getVersion(): number {
        return this.config.version;
    }

    getName(): string {
        return this.config.name;
    }

    protected convertFilterIntoFind(filter:any):Cursor {
        const fields = Object.getOwnPropertyNames(filter);
        const searchItems:SearchItem[] = [];
        fields.forEach((field) => {
            const fieldValue = filter[field];
            let comparison = Compare.equals;
                let compareValue:any = null;
                if (fieldValue.gt) {
                    comparison = Compare.greaterThan;
                    compareValue = fieldValue.gt;
                }
                else if (fieldValue.gte) {
                    comparison = Compare.greaterThanEqual;
                    compareValue = fieldValue.gte;
                }
                else if (fieldValue.lt) {
                    comparison = Compare.lessThan;
                    compareValue = fieldValue.lt;
                }
                else if (fieldValue.lte) {
                    comparison = Compare.lessThanEqual;
                    compareValue = fieldValue.lte;
                }
                else if (fieldValue.eq) {
                    comparison = Compare.equals;
                    compareValue = fieldValue.eq;
                }
                else if (fieldValue.neq) {
                    comparison = Compare.notEquals;
                    compareValue = fieldValue.neq;
                }
                else if (fieldValue.isnotnull) {
                    comparison = Compare.isNotNull;
                }
                else if (fieldValue.isnull) {
                    comparison = Compare.isNull;
                }
                else {
                    comparison = Compare.equals;
                    compareValue = fieldValue;
                }
                const searchItem:SearchItem = {
                    field: field,
                    comparison: comparison,
                    value: compareValue
                }
                searchItems.push(searchItem);
        });

        return this.findBy(searchItems);
    }

    find(filter?:any): Cursor {
        if (filter) {
            return this.convertFilterIntoFind(filter);
        }
        else {
            let result: any[] = [];
            logger(`Collection ${this.config.name} - find`);
            if (filter) logger(filter);
            if (this.buffer.isComplete()) {
                logger(`Collection ${this.config.name} - find all - buffer is complete, getting from there`);
                result = this.buffer.objects();
            } else {
                logger(`Collection ${this.config.name} - find all - loading all files`);
                const contentAndConfig = this.managers.getCollectionFileManager().readEntireCollection(this.config);
                this.buffer.initialise(contentAndConfig.content);
                this.config = contentAndConfig.config;
                result = contentAndConfig.content;
            }
            return new CursorImpl(result);
        }
    }

    insertObject(key: string, object: any): OperationResult {
        let result: OperationResult = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        }

        logger(`Collection ${this.config.name} - insert ${key}`);
        this.config.version++;
        this.buffer.addObject(key, object);
        this.listeners.forEach((listener) => listener.objectAdded(this, key, object));
        return result;
    }

    removeObject(key: string): OperationResult {
        let result: OperationResult = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        }
        logger(`Collection ${this.config.name} - remove ${key}`);
        this.config.version++;
        this.buffer.removeObject(key);
        this.listeners.forEach((listener) => listener.objectRemoved(this, key));
        return result;
    }

    updateObject(key: string, object: any): OperationResult {
        let result: OperationResult = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        }
        logger(`Collection ${this.config.name} - update ${key}`);
        this.config.version++;
        this.buffer.replaceObject(key, object);
        this.listeners.forEach((listener) => listener.objectUpdated(this, key, object));
        return result;
    }

    findBy(search: SearchItem[], sort?:SortOrderItem[]): Cursor {
        return SearchProcessor.searchCollection(this.managers.getIndexManager(), this, search, sort);
    }

    upsertObject(key: string, object: any): OperationResult {
        return this.updateObject(key, object);
    }

    findOne(search: SearchItem[]): any {
        let result: any = undefined;

        const cursor = this.findBy(search);
        const results = cursor.toArray();
        if (results.length > 0) {
            result = results[0];
        }
        return result;
    }

    getKeyFieldName(): string {
        return this.config.key;
    }

    addListener(listener: CollectionListener) {
        this.listeners.push(listener);
    }

    deleteManyByKey(keys: string[]): void {
        keys.forEach((key) => {
            this.removeObject(key);
        })
    }

    deleteMany(filter:any):OperationResult {
        let result:OperationResult = {
            _id:'',
            numberOfObjects:0,
            completed:true
        }
        const keys:string[] = [];
        const cursor = this.find(filter);
        while (cursor.hasNext()) {
            const obj = cursor.next();
            if (obj[this.config.key]) {
                keys.push(obj[this.config.key]);
            }
        }
        result.numberOfObjects = keys.length;
        this.deleteManyByKey(keys);
        return result;

    }

    insertMany(keyObjPairs: KeyObjectPair[]): void {
        keyObjPairs.forEach((keyObjPair) => {
            this.upsertObject(keyObjPair.key, keyObjPair.object);
        })

    }

    // query
    select(field: string): Query {
        const query = new QueryImpl(this.managers.getDB(), this);
        query.select(field);
        return query;
    }

    selectMany(fields: string[]): Query {
        const query = new QueryImpl(this.managers.getDB(), this);
        query.selectMany(fields);
        return query;

    }

}
