import debug from 'debug';
import {BufferType, CollectionConfig, DBConfig, IndexContent, IndexVersion} from "../config/Types";
import {Configurable} from "../config/Configurable";
import fs from "fs";
import {Index} from "./Index";
import {Heartbeat} from "../life/Heartbeat";


const logger = debug('index-file-manager');

export class IndexFileManager implements Configurable, Heartbeat{
    private static _instance: IndexFileManager;
    public static getInstance(): IndexFileManager {
        if (!IndexFileManager._instance) {
            IndexFileManager._instance = new IndexFileManager();
        }
        return IndexFileManager._instance;
    }

    private config:DBConfig|null = null;
    private fileQueueInterval:number;
    private fileWriteQueue:Index[] = [];
    private isProcessingQueue:boolean = false;

    private constructor(){
        const queueInterval = parseInt(process.env.INDEX_QUEUE_INTERVAL || '500');
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
        // const interval = setInterval(() => {
        //     this.processFileQueue();
        // },this.fileQueueInterval);
        logger(`Starting index file manager with queue interval of ${this.fileQueueInterval}`);
    }


    public writeIndexFile(index:Index):void {
        // add the index to the queue, if not already in the queue
        const foundIndex = this.fileWriteQueue.findIndex((indexInQueue) => indexInQueue.getName() === index.getName());
        if (foundIndex < 0) {
            this.fileWriteQueue.push(index);
        }
    }

    public writeIndex(version:IndexVersion, content:IndexContent):void {
        const indexVersionFileName = `${this.config?.dbLocation}/${version.collection}/${version.name}.vrs`;
        if (fs.existsSync(indexVersionFileName)) {
            logger(`Removing old index version file for index ${version.name} at ${indexVersionFileName}`);
            fs.rmSync(indexVersionFileName);
        }
        fs.writeFileSync(indexVersionFileName,JSON.stringify(version));

        const indexContentFileName = `${this.config?.dbLocation}/${version.collection}/${version.name}.idx`;
        if (fs.existsSync(indexContentFileName)) {
            logger(`Removing old index file for index ${version.name} at ${indexContentFileName}`);
            fs.rmSync(indexContentFileName);
        }
        fs.writeFile(indexContentFileName,JSON.stringify(content),{flag:'w'},()=>{});
    }

    public readIndex(collection:string, name:string):{version:IndexVersion, content:IndexContent} {
        let result:any = {
            version:null,
            content:null
        };

        const indexVersionFileName = `${this.config?.dbLocation}/${collection}/${name}.vrs`;
        if (!fs.existsSync(indexVersionFileName)) {
            let indexVersion: IndexVersion = {
                version: 1,
                name: name,
                collection: collection
            }
            logger(`Setting up index version file for index ${name} at ${indexVersionFileName}`);
            fs.writeFileSync(indexVersionFileName, JSON.stringify(indexVersion));
            result.version = indexVersion;
        } else {
            const buffer = fs.readFileSync(indexVersionFileName);
            logger(`Setting up index ${name} - loading existing version file`);
            result.version = <IndexVersion>JSON.parse(buffer.toString());
        }
        const indexContentFileName = `${this.config?.dbLocation}/${collection}/${name}.idx`;
        if (!fs.existsSync(indexContentFileName)) {
            logger(`Creating empty index file for index ${name} at ${indexContentFileName}`);
            const indexContent: IndexContent = {
                version: 1,
                entries: []
            }
            fs.writeFileSync(indexContentFileName, JSON.stringify(indexContent));
            result.content = indexContent;
        }
        else {
            const buffer = fs.readFileSync(indexContentFileName);
            logger(`Setting up index ${name} - loading existing version file`);
            result.content = <IndexVersion>JSON.parse(buffer.toString());
        }

        return result;
    }


    protected processFileQueue():void {
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            this.fileWriteQueue.forEach((index) => {
                this.writeIndex(index.getIndexVersion(),index.getIndexContent());
            });
            this.fileWriteQueue = [];
            this.isProcessingQueue = false;
        }
    }

    die(): void {
        this.processFileQueue();
    }

    getBPM(): number {
        return Math.round(60000/this.fileQueueInterval);
    }

    heartbeat(): void {
        this.processFileQueue();
    }

    isAlive(): boolean {
        return true;
    }

    getName(): string {
        return "Index File Manager";
    }


}
