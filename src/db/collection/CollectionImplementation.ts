import {Collection} from "./Collection";
import {CollectionConfig, OperationResult} from "../Types";
import {ObjectBuffer} from "../buffer/ObjectBuffer";
import {BufferFactory} from "../buffer/BufferFactory";
import {CollectionFileManager} from "./CollectionFileManager";
import debug from 'debug';
import {IndexManager} from "../index/IndexManager";
import {SearchFilter} from "../search/SearchTypes";
import {SearchProcessor} from "../search/SearchProcessor";

const logger = debug('collection-implementation');


export class CollectionImplementation implements Collection {
    private config: CollectionConfig;
    private buffer: ObjectBuffer;

    constructor(config: CollectionConfig) {
        this.config = config;
        this.buffer = BufferFactory.getInstance().createBuffer(config);
        if (this.buffer.isComplete()) {
            logger(`Collection ${this.config.name} - buffer is complete - loading all`);
            // load all content
            const contentAndConfig = CollectionFileManager.getInstance().readEntireCollection(this.config);
            this.buffer.initialise(contentAndConfig.content);
            this.config = contentAndConfig.config;
        }
        else {
            logger(`Collection ${this.config.name} - buffer is not complete - loading config`);
            this.config = CollectionFileManager.getInstance().readCollectionConfig(this.config);
        }
    }

    findByKey(key: string) {
        logger(`Collection ${this.config.name} - find by key ${key}`);
        let result: any | null = null;
        if (this.buffer.hasKey(key)) {
            logger(`Collection ${this.config.name} - find by key ${key} - found in buffer`);
            result = this.buffer.getObject(key);
        } else {
            // object could still be in write queue
            result = CollectionFileManager.getInstance().checkWriteQueueForDataObject(this.config.name, key);
            if (result) {
                logger(`Collection ${this.config.name} - find by key ${key} - found in file manager write queue`);
            } else {
                logger(`Collection ${this.config.name} - find by key ${key} - trying to load from file`);
                result = CollectionFileManager.getInstance().readDataObjectFile(this.config.name, key);
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

    find(): any[] {
        logger(`Collection ${this.config.name} - find all`);
        let result: any[] = [];
        if (this.buffer.isComplete()) {
            logger(`Collection ${this.config.name} - find all - buffer is complete, getting from there`);
            result = this.buffer.objects();
        } else {
            logger(`Collection ${this.config.name} - find all - loading all files`);
            const contentAndConfig = CollectionFileManager.getInstance().readEntireCollection(this.config);
            this.buffer.initialise(contentAndConfig.content);
            this.config = contentAndConfig.config;
            result = contentAndConfig.content;
        }
        return result;
    }

    insertObject(key: string, object: any): OperationResult {
        let result: OperationResult = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        }

        logger(`Collection ${this.config.name} - insert ${key}`);
        this.config.version++;
        CollectionFileManager.getInstance().writeDataObjectFile(this.config,this.config.name, key, object,true);
        this.buffer.addObject(key, object);
        IndexManager.getInstance().entryInserted(this.config.name,key,this.config.version,object);
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
        CollectionFileManager.getInstance().removeDataObjectFile(this.config,this.config.name, key);
        this.buffer.removeObject(key);
        IndexManager.getInstance().entryDeleted(this.config.name,key,this.config.version);
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
        CollectionFileManager.getInstance().writeDataObjectFile(this.config,this.config.name, key, object,false);
        this.buffer.replaceObject(key, object);
        IndexManager.getInstance().entryUpdated(this.config.name,key,this.config.version,object);
        return result;
    }

    findBy(search:SearchFilter):any[] {
        return SearchProcessor.searchCollection(this,search);
    }

    upsertObject(key: string, object: any): OperationResult {
        return this.updateObject(key,object);
    }

}
