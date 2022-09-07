import {Collection} from "./Collection";
import {CollectionConfig, OperationResult} from "./Types";
import {ObjectBuffer} from "./buffer/ObjectBuffer";
import {BufferFactory} from "./buffer/BufferFactory";
import {FileManager} from "./file/FileManager";
import {v4} from "uuid";


export class CollectionImplementation implements Collection {
    private config:CollectionConfig;
    private buffer:ObjectBuffer;

    constructor(config:CollectionConfig) {
        this.config = config;
        this.buffer = BufferFactory.getInstance().createBuffer(config);
        if (this.buffer.isComplete()) {
            // load all content
            const collection = FileManager.getInstance().readEntireCollection(this.config.name);
            this.buffer.initialise(collection);
        }
    }

    findByKey(key: string) {
        let result:any|null = null;
        if (this.buffer.hasKey(key)) {
            result = this.buffer.getObject(key);
        }
        else {
            result = FileManager.getInstance().readDataObjectFile(this.config.name,key);
            if (result) {
                this.buffer.addObject(key,result);
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
        let result:any[] = [];
        if (this.buffer.isComplete()) {
            result = this.buffer.objects();
        }
        else {
            const collection = FileManager.getInstance().readEntireCollection(this.config.name);
            this.buffer.initialise(collection);
        }
        return result;
    }

    insertObject(key: string, object: any): OperationResult {
        let result:OperationResult = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        }
        if (FileManager.getInstance().isDuplicateKey(this.config.name,key)) {
            key = v4();
            result._id = key;
            FileManager.getInstance().writeDataObjectFile(this.config.name,key,object);
        }
        else {
            FileManager.getInstance().writeDataObjectFile(this.config.name,key,object);
        }
        this.buffer.addObject(key, object);
        return result;
    }

    removeObject(key: string): OperationResult {
        let result:OperationResult = {
            _id: key,
            completed: true,
            numberOfObjects: 0
        }
        if (FileManager.getInstance().removeDataObjectFile(this.config.name,key)) {
            result.numberOfObjects = 1;
        }
        this.buffer.removeObject(key);
        return result;
    }

    updateObject(key: string, object: any): OperationResult {
        let result:OperationResult = {
            _id: key,
            completed: true,
            numberOfObjects: 1
        }
        FileManager.getInstance().writeDataObjectFile(this.config.name,key,object);
        this.buffer.replaceObject(key, object);
        return result;
    }

}
