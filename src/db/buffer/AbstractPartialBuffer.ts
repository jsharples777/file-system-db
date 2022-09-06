import {BufferEntry, ObjectBuffer} from "./ObjectBuffer";
import {BufferType, CollectionConfig} from "../Types";
import moment from "moment";

export class AbstractPartialBuffer implements ObjectBuffer {
    protected bufferContent:BufferEntry[];
    protected config:CollectionConfig;
    protected bufferSize:number;
    protected objectLifespan:number;
    private maxFifoBufferSize:number;
    private defaultBufferItemLifespan:number;

    constructor(config:CollectionConfig) {
        this.config = config;
        this.bufferContent = [];

        const maxFifoBufferSize = parseInt(process.env.MAX_FIFO_BUFFER_SIZE || '1000');
        if (isNaN(maxFifoBufferSize)) {
            this.maxFifoBufferSize = 1000;
        }
        else {
            this.maxFifoBufferSize = maxFifoBufferSize;
        }
        const defaultBufferItemLifespan = parseInt(process.env.DEFAULT_BUFFER_ITEM_LIFESPAN || '60000');
        if (isNaN(defaultBufferItemLifespan)) {
            this.defaultBufferItemLifespan = 60000;
        }
        else {
            this.defaultBufferItemLifespan = defaultBufferItemLifespan;
        }


        if (config.bufferType === BufferType.FIFO) {
            if (config.bufferSize && config.bufferSize > 0) {
                this.bufferSize = config.bufferSize;
            }
            else {
                this.bufferSize = this.maxFifoBufferSize;
            }
        }
        else {
            this.bufferSize = 0;
        }

        if (config.bufferType === BufferType.LIFESPAN) {
            if (config.bufferItemLifecycleMilliseconds) {
                this.objectLifespan = config.bufferItemLifecycleMilliseconds;
            }
            else {
                this.objectLifespan = this.defaultBufferItemLifespan;
            }
        }
        else {
            this.objectLifespan = -1;
        }

        this.checkObjectLifespans = this.checkObjectLifespans.bind(this);


        // start a buffer cleaner for object lifespans if necessary
        if (this.config.bufferType === BufferType.LIFESPAN) {
            const interval = setInterval(() => {
                this.checkObjectLifespans();
            },(this.defaultBufferItemLifespan*1000)/2);
        }
    }

    isComplete(): boolean {
        return false;
    }

    private _addObject(key:string, object:any):void {
        let timeToDie = -1;
        const lastUsed = parseInt(moment().format('YYYYMMDDHHmmss'));
        if (this.config.bufferType === BufferType.LIFESPAN) {
            timeToDie = parseInt(moment().add(this.objectLifespan,'seconds').format('YYYYMMDDHHmmss'));
        }
        const entry:BufferEntry = {
            key: key,
            lastUsed: lastUsed,
            timeToDie: timeToDie,
            content: object
        };
        this.bufferContent.unshift(entry);

        if (this.config.bufferType === BufferType.FIFO) {
            if (this.bufferContent.length > this.bufferSize) {
                this.bufferContent.pop();
            }
        }
    }

    addObject(key: string, object: any): void {
        if (!this.hasKey(key)) {
            this._addObject(key,object);
        }
        else {
            this.replaceObject(key, object);
        }
    }

    getObject(key: string): any {
        let result = null;

        const foundIndex = this.bufferContent.findIndex((entry) => entry.key === key);
        if (foundIndex >= 0) {
            result = this.bufferContent[foundIndex].content;
        }

        return result;
    }

    hasKey(key: string): boolean {
        return (this.bufferContent.findIndex((entry) => entry.key === key) >= 0);
    }

    initialise(objects: any[]): void {
        this.bufferContent = [];
        const lastUsed = parseInt(moment().format('YYYYMMDDHHmmss'));


        objects.forEach((object) => {
            const entry:BufferEntry = {
                key: object[this.config.key],
                lastUsed: lastUsed,
                timeToDie: -1,
                content: object
            };
            this.bufferContent.push(entry);
        });
    }

    objects(): any[] {
        let results:any[] = [];
        this.bufferContent.forEach((entry) => {
            results.push(entry.content);
        });
        return results;
    }

    removeObject(key: string): void {
        const foundIndex = this.bufferContent.findIndex((entry) => entry.key === key);
        if (foundIndex >= 0) {
            this.bufferContent.splice(foundIndex,1);
        }
    }

    replaceObject(key: string, object: any): void {
        const foundIndex = this.bufferContent.findIndex((entry) => entry.key === key);
        if (foundIndex >= 0) {
            this.bufferContent[foundIndex].content = object;
            if (this.config.bufferType === BufferType.LIFESPAN) {
                const timeToDie = parseInt(moment().add(this.objectLifespan,'seconds').format('YYYYMMDDHHmmss'));
                this.bufferContent[foundIndex].timeToDie = timeToDie;
            }
        }
        else {
            this._addObject(key, object);
        }
    }

    protected checkObjectLifespans():void {
        const now = parseInt(moment().format('YYYYMMDDHHmmss'));
        let index = this.bufferContent.length - 1;
        while (index >= 0) {
            const entry = this.bufferContent[index];
            if (entry) {
                if (entry.timeToDie >= now) {
                    this.bufferContent.splice(index,1);
                }
            }
            index--;
        }
    }


}
