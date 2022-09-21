import debug from 'debug';
import {CollectionConfig, DBConfig, DuplicateKey} from "../config/Types";
import {Configurable} from "../config/Configurable";
import fs from "fs";
import {Collection} from "./Collection";
import {Life} from "../life/Life";
import {CollectionListener} from "./CollectionListener";
import {Util} from "../util/Util";
import {DatabaseManagers} from "../DatabaseManagers";


const logger = debug('collection-file-manager');
const dLogger = debug('collection-file-manager-detail');

export enum CollectionFileQueueEntryOperation {
    write = 1,
    delete = -1

}


export type FileQueueEntry = {
    config: CollectionConfig,
    collection: string,
    key: string,
    object: any,
    operation: CollectionFileQueueEntryOperation
}

export class CollectionFileManager implements Configurable, Life, CollectionListener {

    private config: DBConfig | null = null;
    private fileQueueInterval: number;
    private fileWriteQueue: FileQueueEntry[] = [];
    private isProcessingQueue: boolean = false;
    private managers: DatabaseManagers;

    public constructor(managers: DatabaseManagers) {
        this.managers = managers;
        const queueInterval = parseInt(process.env.FILE_QUEUE_INTERVAL || '500');
        if (isNaN(queueInterval)) {
            this.fileQueueInterval = 500;
        } else {
            this.fileQueueInterval = queueInterval;
        }

        this.processFileQueue = this.processFileQueue.bind(this);
        this.addFileEntries = this.addFileEntries.bind(this);
        this.addFileEntry = this.addFileEntry.bind(this);


    }

    loadConfig(config: DBConfig): void {
        this.config = config;
        // const interval = setInterval(() => {
        //     this.processFileQueue();
        // },this.fileQueueInterval);
        logger(`Starting file manager with queue interval of ${this.fileQueueInterval}`);
    }

    public isDuplicateKey(collection: string, key: string): boolean {
        let result = false;
        const collectionDir = `${this.config?.dbLocation}/${collection}`;
        const files: string[] = fs.readdirSync(collectionDir);
        files.every((file) => {
            if (file.startsWith(key)) {
                result = true;
                return false;
            } else {
                return true;
            }
        })

        logger(`Is duplicate key for collection ${collection} and key ${key} = ${result}`);
        return result;
    }

    public writeDataObjectFile(config: CollectionConfig, collection: string, key: string, object: any, checkForDuplicateKey: boolean): void {
        if (checkForDuplicateKey) {
            if (this.isDuplicateKey(collection, key)) {
                throw new DuplicateKey(`Key ${key} is already present in collection ${collection}`);
            }
        }
        const entry = {
            config: Util.copyObject(config),
            collection,
            key,
            object,
            operation: CollectionFileQueueEntryOperation.write
        };
        if (config.highVolumeChanges) {
            logger(`Immediately writing file ${key} for collection ${collection}`);
            this.writeDataObjectFileContent(config,collection,key,object);
        }
        else {
            this.fileWriteQueue.push(entry);
        }
        this.managers.getLogFileManager().addOperation(entry);
    }

    public addFileEntry(entry: FileQueueEntry): void {
        this.fileWriteQueue.push(entry);
    }

    public addFileEntries(entries: FileQueueEntry[]): void {

        entries.forEach((entry) => {
            this.fileWriteQueue.push(entry);
        })


    }

    public removeDataObjectFile(config: CollectionConfig, collection: string, key: string): void {
        const entry = {
            config: Util.copyObject(config),
            collection,
            key,
            object: null,
            operation: CollectionFileQueueEntryOperation.delete
        };
        if (config.highVolumeChanges) {
            logger(`Immediately removing file ${key} for collection ${collection}`);
            this.removeDataObjectFileContent(config, collection,key);
        }
        else {
            this.fileWriteQueue.push(entry);
        }
        this.managers.getLogFileManager().addOperation(entry);
    }

    public readDataObjectFile(collection: string, key: string): any | null {
        let result: any | null = null;

        const objectFileName = `${this.config?.dbLocation}/${collection}/${key}.entry`;

        if (fs.existsSync(objectFileName)) {
            const content = fs.readFileSync(objectFileName);
            try {
                result = JSON.parse(content.toString());
                logger(`Loading entry for collection ${collection}, entry ${key}`);
            } catch (err) {
                //invalid JSON - delete the file
                fs.rmSync(objectFileName);
            }
        } else {
            logger(`File Not Found for collection ${collection}, entry ${key}`);
        }

        return result;
    }

    public checkWriteQueueForDataObject(collection: string, key: string): any | null {
        let result: any | null = null;
        this.fileWriteQueue.forEach((entry) => {
            if (entry.operation === CollectionFileQueueEntryOperation.write) {
                if (entry.key === key) {
                    result = entry.object;
                }
            }
        });
        return result;
    }

    public readCollectionConfig(collectionConfig: CollectionConfig): CollectionConfig {
        let result: CollectionConfig = Util.copyObject(collectionConfig);
        const configFileName = `${this.config?.dbLocation}/${collectionConfig.name}/${collectionConfig.name}.vrs`;
        if (!fs.existsSync(configFileName)) {
            result.version = 1;

        } else {
            const existingVrsFile = <CollectionConfig>JSON.parse(fs.readFileSync(configFileName).toString());
            result.version = existingVrsFile.version;
        }
        fs.writeFileSync(configFileName, JSON.stringify(result));
        return result;
    }

    public readEntireCollection(collectionConfig: CollectionConfig): {
        config: CollectionConfig,
        content: any[]
    } {
        logger(`Loading collection ${collectionConfig.name}`);

        let results: any = {
            config: {},
            content: []
        };
        const collectionDir = `${this.config?.dbLocation}/${collectionConfig.name}`;
        const files: string[] = fs.readdirSync(collectionDir);
        files.forEach((file) => {
            if (file.endsWith('.entry')) {
                const key = file.split('.')[0];
                results.content.push(this.readDataObjectFile(collectionConfig.name, key));
            }
        });
        results.config = this.readCollectionConfig(collectionConfig);


        return results;
    }

    die(): void {
        this.processFileQueue();
    }

    getBPM(): number {
        return Math.round(60000 / this.fileQueueInterval);
    }

    heartbeat(): void {
        this.processFileQueue();
    }

    isAlive(): boolean {
        return true;
    }

    getName(): string {
        return 'Collection File Manager'
    }

    birth() {
    }

    objectAdded(collection: Collection, key: string, object: any): void {
        this.writeDataObjectFile(collection.getConfig(), collection.getName(), key, object, true);
    }

    objectRemoved(collection: Collection, key: string): void {
        this.removeDataObjectFile(collection.getConfig(), collection.getName(), key);
    }

    objectUpdated(collection: Collection, key: string, object: any): void {
        this.writeDataObjectFile(collection.getConfig(), collection.getName(), key, object, false);
    }

    protected writeCollectionConfig(config: CollectionConfig): void {
        const objectFileName = `${this.config?.dbLocation}/${config.name}/${config.name}.vrs`;
        if (fs.existsSync(objectFileName)) {
            logger(`Config File Found for collection ${config.name} - overwriting`);
            fs.rmSync(objectFileName);
        }
        fs.writeFileSync(objectFileName, JSON.stringify(config));

    }

    protected writeDataObjectFileContent(config: CollectionConfig, collection: string, key: string, object: any): void {
        const objectFileName = `${this.config?.dbLocation}/${collection}/${key}.entry`;
        if (fs.existsSync(objectFileName)) {
            logger(`File Found for collection ${collection}, entry ${key} - overwriting`);
            fs.rmSync(objectFileName);
        }
        fs.writeFileSync(objectFileName, JSON.stringify(object));
        dLogger(`Writing data object ${key} for collection ${collection}`);
        this.writeCollectionConfig(config);
    }

    protected removeDataObjectFileContent(config: CollectionConfig, collection: string, key: string): boolean {
        let result = false;
        const objectFileName = `${this.config?.dbLocation}/${collection}/${key}.entry`;
        if (fs.existsSync(objectFileName)) {
            result = true;
            fs.rmSync(objectFileName);
            dLogger(`Deleting entry for collection ${collection}, entry ${key}`);
            this.writeCollectionConfig(config);
        } else {
            logger(`Deleting entry for collection ${collection}, entry ${key} - File not found ${objectFileName}`);
        }
        return result;
    }

    protected processFileQueue(): void {
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            this.fileWriteQueue.forEach((entry) => {
                if (entry.operation === CollectionFileQueueEntryOperation.write) {
                    this.writeDataObjectFileContent(entry.config, entry.collection, entry.key, entry.object);
                } else {
                    this.removeDataObjectFileContent(entry.config, entry.collection, entry.key);
                }
            });
            this.fileWriteQueue = [];
            this.isProcessingQueue = false;
        }
    }


}
