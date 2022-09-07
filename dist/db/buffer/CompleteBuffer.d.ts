import { BufferEntry, ObjectBuffer } from "./ObjectBuffer";
import { CollectionConfig } from "../Types";
export declare class CompleteBuffer implements ObjectBuffer {
    protected bufferContent: BufferEntry[];
    protected config: CollectionConfig;
    constructor(config: CollectionConfig);
    addObject(key: string, object: any): void;
    getObject(key: string): any;
    hasKey(key: string): boolean;
    initialise(objects: any[]): void;
    objects(): any[];
    removeObject(key: string): void;
    replaceObject(key: string, object: any): void;
    isComplete(): boolean;
}
