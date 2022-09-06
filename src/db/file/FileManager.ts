import debug from 'debug';
import {BufferType, CollectionConfig, DBConfig} from "../Types";
import {Configurable} from "../Configurable";
import fs from "fs";


const logger = debug('file-manager');

type FileQueueEntry = {
    collection:string,
    key:string,
    object:any
}

export class FileManager implements Configurable{
    private static _instance: FileManager;
    public static getInstance(): FileManager {
        if (!FileManager._instance) {
            FileManager._instance = new FileManager();
        }
        return FileManager._instance;
    }

    private config:DBConfig|null = null;
    private fileQueueInterval:number;
    private fileWriteQueue:FileQueueEntry[] = [];
    private isProcessingQueue:boolean = false;

    private constructor(){
        const queueInterval = parseInt(process.env.FILE_QUEUE_INTERVAL || '500');
        if (isNaN(queueInterval)) {
            this.fileQueueInterval = 500;
        }
        else {
            this.fileQueueInterval = queueInterval;
        }

        this.processFileQueue = this.processFileQueue.bind(this);


    }

    loadConfig(config: DBConfig): void {
        this.config = config;
        const interval = setInterval(() => {
            this.processFileQueue();
        },this.fileQueueInterval);
    }

    public writeDataObjectFile(collection:string, key:string, object:any):void {
        this.fileWriteQueue.push({
            collection,
            key,
            object
        });
    }

    public readDataObjectFile(collection:string, key:string):any|null {
        let result:any|null = null;

        const objectFileName = `${this.config?.dbLocation}/${collection}/${key}.entry`;

        if (fs.existsSync(objectFileName)) {
            logger(`File Not Found for collection ${collection}, entry ${key}`);
            const content = fs.readFileSync(objectFileName);
            try {
                result = JSON.parse(content.toString());
            }
            catch (err) {
                //invalid JSON - delete the file
                fs.rmSync(objectFileName);
            }
        }

        return result;
    }


    protected writeDataObjectFileContent(collection:string, key:string,object:any):void {
        const objectFileName = `${this.config?.dbLocation}/${collection}/${key}.entry`;
        if (fs.existsSync(objectFileName)) {
            logger(`File Found for collection ${collection}, entry ${key} - overwriting`);
            fs.rmSync(objectFileName);
        }
        fs.writeFileSync(objectFileName,JSON.stringify(object));
    }


    protected processFileQueue():void {
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            this.fileWriteQueue.forEach((entry) => {
                this.writeDataObjectFileContent(entry.collection,entry.key, entry.object);
            });
            this.isProcessingQueue = false;
        }
    }

    public readEntireCollection(collection:string):any[] {
        let results:any[] = [];
        const collectionDir = `${this.config?.dbLocation}/${collection}`;
        const files: string[] = fs.readdirSync(collectionDir);
        files.forEach((file) => {
            if (file.endsWith('.entry')) {
                const key = file.split('.')[0];
                results.push(this.readDataObjectFile(collection,key));
            }
        });

        return results;
    }


}
