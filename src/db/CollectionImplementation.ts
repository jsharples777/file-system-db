import {Collection} from "./Collection";
import {CollectionConfig, OperationResult} from "./Types";
import {ObjectBuffer} from "./buffer/ObjectBuffer";
import {BufferFactory} from "./buffer/BufferFactory";
import {FileManager} from "./file/FileManager";
import debug from 'debug';

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
            const collection = FileManager.getInstance().readEntireCollection(this.config.name);
            this.buffer.initialise(collection);
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
            result = FileManager.getInstance().checkWriteQueueForDataObject(this.config.name, key);
            if (result) {
                logger(`Collection ${this.config.name} - find by key ${key} - found in file manager write queue`);
            } else {
                logger(`Collection ${this.config.name} - find by key ${key} - trying to load from file`);
                result = FileManager.getInstance().readDataObjectFile(this.config.name, key);
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
            const collection = FileManager.getInstance().readEntireCollection(this.config.name);
            this.buffer.initialise(collection);
            result = collection;
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
        FileManager.getInstance().writeDataObjectFile(this.config.name, key, object);
        this.buffer.addObject(key, object);
        return result;
    }

    removeObject(key: string): OperationResult {
        let result: OperationResult = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        }
        logger(`Collection ${this.config.name} - remove ${key}`);
        FileManager.getInstance().removeDataObjectFile(this.config.name, key);
        this.buffer.removeObject(key);
        return result;
    }

    updateObject(key: string, object: any): OperationResult {
        let result: OperationResult = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        }
        logger(`Collection ${this.config.name} - update ${key}`);
        FileManager.getInstance().writeDataObjectFile(this.config.name, key, object);
        this.buffer.replaceObject(key, object);
        return result;
    }

}
