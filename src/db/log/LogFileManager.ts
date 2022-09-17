import debug from 'debug';
import fs from "fs";
import {Life} from "../life/Life";
import {FileQueueEntry} from "../collection/CollectionFileManager";
import {DatabaseManagers} from "../DatabaseManagers";


const logger = debug('log-file-manager');


export class LogFileManager implements Life {
    private logLocation: string;
    private fileQueueInterval: number;
    private fileWriteQueue: FileQueueEntry[] = [];
    private isProcessingQueue: boolean = false;
    private bIsAlive: boolean = false;
    private managers: DatabaseManagers;

    public constructor(managers: DatabaseManagers) {
        this.managers = managers;
        this.logLocation = process.env.LOG_FILE_LOCATION || 'log/operations.json';

        const queueInterval = parseInt(process.env.FILE_QUEUE_INTERVAL || '500');
        if (isNaN(queueInterval)) {
            this.fileQueueInterval = 500;
        } else {
            this.fileQueueInterval = queueInterval;
        }

        this.processFileQueue = this.processFileQueue.bind(this);
        this.setLogLocation = this.setLogLocation.bind(this);
        this.addOperation = this.addOperation.bind(this);
        this.loadLogFile = this.loadLogFile.bind(this);
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
        return this.bIsAlive;
    }

    getName(): string {
        return 'Log File Manager'
    }

    birth() {
        this.bIsAlive = true;
    }

    public setLogLocation(logLocation: string): void {
        this.logLocation = logLocation;
    }

    public addOperation(entry: FileQueueEntry): void {
        if (this.managers.getDB().isLoggingChanges()) {
            this.fileWriteQueue.push(entry);
        }

    }

    public loadLogFile(logFileLocation: string): void {
        this.managers.getLifecycleManager().suspend();

        const entries: FileQueueEntry[] = [];

        const buffer = fs.readFileSync(logFileLocation);
        const bufferLines = buffer.toString().split('\r\n');
        bufferLines.forEach((line) => {
            if (line.trim().length > 0) {
                try {
                    const entry = <FileQueueEntry>JSON.parse(line.trim());
                    entries.push(entry);

                } catch (err) {
                    console.log(err);

                }
            }
        });
        logger('Loaded ' + entries.length + ' entries from log file ' + logFileLocation);
        this.managers.getCollectionFileManager().addFileEntries(entries);
        fs.rmSync(logFileLocation);

        this.managers.getLifecycleManager().resume();


    }

    protected processFileQueue(): void {
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            if (this.fileWriteQueue.length > 0) {
                let buffer = '';
                this.fileWriteQueue.forEach((entry) => {
                    buffer += JSON.stringify(entry) + '\r\n';
                });
                console.log(buffer);
                fs.appendFile(this.logLocation, buffer, 'utf8', () => {
                });
                this.fileWriteQueue = [];

            }
            this.isProcessingQueue = false;
        }
    }
}
