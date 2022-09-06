import {BufferEntry, ObjectBuffer} from "./ObjectBuffer";
import {CollectionConfig} from "../Types";
import moment from "moment";

export class CompleteBuffer implements ObjectBuffer {
    protected bufferContent:BufferEntry[];
    protected config:CollectionConfig;

    constructor(config:CollectionConfig) {
        this.config = config;
        this.bufferContent = [];
    }

    addObject(key: string, object: any): void {
        if (!this.hasKey(key)) {
            const lastUsed = parseInt(moment().format('YYYYMMDDHHmmss'));
            const entry:BufferEntry = {
                key: object[this.config.key],
                lastUsed: lastUsed,
                timeToDie: -1,
                content: object
            };
            this.bufferContent.push(entry);
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
        }
    }

    isComplete(): boolean {
        return true;
    }


}
