import {BufferEntry, ObjectBuffer} from "./ObjectBuffer";
import {BufferType, CollectionConfig} from "../config/Types";
import moment from "moment";
import debug from 'debug';
import {Life} from "../life/Life";
import {LifeCycleManager} from "../life/LifeCycleManager";

const logger = debug('abstract-partial-buffer');
const dLogger = debug('abstract-partial-buffer-detail');

export class AbstractPartialBuffer implements ObjectBuffer, Life {
    protected bufferContent: BufferEntry[];
    protected config: CollectionConfig;
    protected bufferSize: number;
    protected objectLifespan: number;
    private maxFifoBufferSize: number;
    private defaultBufferItemLifespan: number;
    private lifeManager: LifeCycleManager | undefined;

    constructor(config: CollectionConfig, lifeManager?: LifeCycleManager) {
        this.config = config;
        this.lifeManager = lifeManager;
        this.bufferContent = [];
        this.checkObjectLifespans = this.checkObjectLifespans.bind(this);

        const maxFifoBufferSize = parseInt(process.env.MAX_FIFO_BUFFER_SIZE || '1000');
        if (isNaN(maxFifoBufferSize)) {
            this.maxFifoBufferSize = 1000;
        } else {
            this.maxFifoBufferSize = maxFifoBufferSize;
        }
        const defaultBufferItemLifespan = parseInt(process.env.DEFAULT_BUFFER_ITEM_LIFESPAN_SEC || '600');
        if (isNaN(defaultBufferItemLifespan)) {
            this.defaultBufferItemLifespan = 600;
        } else {
            this.defaultBufferItemLifespan = defaultBufferItemLifespan;
        }

        this.bufferSize = 0;
        this.objectLifespan = -1;

        switch (config.bufferType) {
            case(BufferType.FIFO): {
                if (config.bufferSize && config.bufferSize > 0) {
                    this.bufferSize = config.bufferSize;
                } else {
                    this.bufferSize = this.maxFifoBufferSize;
                }
                logger(`Created FIFO buffer for collection ${config.name} with buffer size ${this.bufferSize}`);
                break;
            }
            case(BufferType.LIFESPAN): {
                if (config.bufferItemLifecycleSeconds) {
                    this.objectLifespan = config.bufferItemLifecycleSeconds;
                } else {
                    this.objectLifespan = this.defaultBufferItemLifespan;
                }
                if (this.lifeManager) this.lifeManager.addLife(this);
                logger(`Created Lifespan buffer for collection ${config.name} with object lifespan of ${this.objectLifespan} `);
                break;
            }
            case(BufferType.ALL): {

                break;
            }
        }

    }


    isComplete(): boolean {
        return false;
    }

    addObject(key: string, object: any): void {
        if (!this.hasKey(key)) {
            this._addObject(key, object);
        } else {
            this.replaceObject(key, object);
        }
    }

    getObject(key: string): any {
        let result = null;

        const foundIndex = this.bufferContent.findIndex((entry) => entry.key === key);
        if (foundIndex >= 0) {
            const entry = this.bufferContent[foundIndex];
            result = entry.content;
            if (this.config.bufferType === BufferType.LIFESPAN) {
                entry.timeToDie = parseInt(moment().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
            }
        }

        return result;
    }

    hasKey(key: string): boolean {
        return (this.bufferContent.findIndex((entry) => entry.key === key) >= 0);
    }

    initialise(objects: any[]): void {
        this.bufferContent = [];
        let timeToDie = -1;
        const lastUsed = parseInt(moment().format('YYYYMMDDHHmmss'));
        if (this.config.bufferType === BufferType.LIFESPAN) {
            timeToDie = parseInt(moment().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
        }

        objects.forEach((object, index) => {
            const entry: BufferEntry = {
                key: object[this.config.key],
                lastUsed: lastUsed,
                timeToDie: timeToDie,
                content: object
            };
            if (this.config.bufferType === BufferType.FIFO) {
                if (index < this.bufferSize) {
                    this.bufferContent.push(entry);
                }
            } else {
                this.bufferContent.push(entry);
            }

        });
    }

    objects(): any[] {
        let results: any[] = [];
        const timeToDie = parseInt(moment().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
        this.bufferContent.forEach((entry) => {
            results.push(entry.content);
            if (this.config.bufferType === BufferType.LIFESPAN) {
                entry.timeToDie = timeToDie;
            }
        });
        return results;
    }

    removeObject(key: string): void {
        const foundIndex = this.bufferContent.findIndex((entry) => entry.key === key);
        if (foundIndex >= 0) {
            logger(`Removing object ${key} from buffer for collection ${this.config.name}`);
            this.bufferContent.splice(foundIndex, 1);
        }
    }

    replaceObject(key: string, object: any): void {
        const foundIndex = this.bufferContent.findIndex((entry) => entry.key === key);
        if (foundIndex >= 0) {
            this.bufferContent[foundIndex].content = object;
            if (this.config.bufferType === BufferType.LIFESPAN) {
                const timeToDie = parseInt(moment().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
                this.bufferContent[foundIndex].timeToDie = timeToDie;
                logger(`Replacing object ${key} to lifespan buffer for collection ${this.config.name}, restarting lifespan of ${this.objectLifespan} seconds`);
            } else {
                logger(`Replacing object ${key} from buffer for collection ${this.config.name}`);
            }
        } else {
            this._addObject(key, object);
        }
    }

    getName(): string {
        return 'Lifespan Buffer'
    }

    isAlive(): boolean {
        return true;
    }

    heartbeat(): void {
        this.checkObjectLifespans();
    }

    birth(): void {

    }

    die(): void {
    }

    getBPM(): number {
        return 60 / (this.objectLifespan / 2);
    }

    protected checkObjectLifespans(): void {
        if (this.bufferContent.length > 0) {
            logger(`Lifespan buffer for collection ${this.config.name} - checking lifespans for ${this.bufferContent.length} objects`);
            const now = parseInt(moment().format('YYYYMMDDHHmmss'));
            let index = this.bufferContent.length - 1;
            let removedCount = 0;
            while (index >= 0) {
                const entry = this.bufferContent[index];
                if (entry) {
                    dLogger(`Object ${entry.key} for collection ${this.config.name} time to die is ${entry.timeToDie} vs ${now}`);
                    if (entry.timeToDie <= now) {
                        dLogger(`Object ${entry.key} for collection ${this.config.name} has expired - removing`);
                        this.bufferContent.splice(index, 1);
                        removedCount++;
                    }
                }
                index--;
            }
            logger(`Lifespan buffer for collection ${this.config.name} - removed ${removedCount} objects`);
        }
    }

    private _addObject(key: string, object: any): void {
        let timeToDie = -1;
        const lastUsed = parseInt(moment().format('YYYYMMDDHHmmss'));
        if (this.config.bufferType === BufferType.LIFESPAN) {
            timeToDie = parseInt(moment().add(this.objectLifespan, 'seconds').format('YYYYMMDDHHmmss'));
            logger(`Adding object ${key} to lifespan buffer for collection ${this.config.name} with lifespan of ${this.objectLifespan} seconds`);
        } else {
            logger(`Adding object ${key} to buffer for collection ${this.config.name}`);
        }
        const entry: BufferEntry = {
            key: key,
            lastUsed: lastUsed,
            timeToDie: timeToDie,
            content: object
        };
        this.bufferContent.unshift(entry);

        if (this.config.bufferType === BufferType.FIFO) {
            if (this.bufferContent.length > this.bufferSize) {
                logger(`FIFO buffer for collection ${this.config.name} too large, removing oldest entry`);
                this.bufferContent.pop();
            }
        }
    }


}
