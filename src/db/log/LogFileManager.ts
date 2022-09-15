import debug from 'debug';
import fs from "fs";
import {Life} from "../life/Life";
import {CollectionFileQueueEntryOperation, FileQueueEntry} from "../collection/CollectionFileManager";
import {Util} from "../util/Util";



const logger = debug('log-file-manager');



export class LogFileManager implements Life {
    private logLocation: string;
    private fileQueueInterval: number;
    private fileWriteQueue: FileQueueEntry[] = [];
    private isProcessingQueue: boolean = false;
    private bIsAlive:boolean = false;


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
        return this.bIsAlive;
    }

    getName(): string {
        return 'Log File Manager'
    }

    birth() {
        this.bIsAlive = true;
    }


    public constructor() {
        this.logLocation = process.env.LOG_FILE_LOCATION || 'log/operations.json';

        const queueInterval = parseInt(process.env.FILE_QUEUE_INTERVAL || '500');
        if (isNaN(queueInterval)) {
            this.fileQueueInterval = 500;
        } else {
            this.fileQueueInterval = queueInterval;
        }

        this.processFileQueue = this.processFileQueue.bind(this);
    }

    public addOperation(entry:FileQueueEntry):void {
        this.fileWriteQueue.push(entry);
    }

    protected processFileQueue(): void {
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            let operationList: any[] = [];
            if (fs.existsSync(this.logLocation)) {
                const buffer = fs.readFileSync(this.logLocation);
                try {
                    operationList = JSON.parse(buffer.toString());
                } catch (err) {
                    logger(`Invalid log file ${this.logLocation}`);
                }
                fs.rmSync(this.logLocation);
            }
            operationList.push(this.fileWriteQueue);
            fs.writeFileSync(this.logLocation,JSON.stringify(operationList));
            this.fileWriteQueue = [];
            this.isProcessingQueue = false;
        }
    }


}
