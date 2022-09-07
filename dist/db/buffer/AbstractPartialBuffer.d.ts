import { BufferEntry, ObjectBuffer } from "./ObjectBuffer";
import { CollectionConfig } from "../Types";
export declare class AbstractPartialBuffer implements ObjectBuffer {
    protected bufferContent: BufferEntry[];
    protected config: CollectionConfig;
    protected bufferSize: number;
    protected objectLifespan: number;
    private maxFifoBufferSize;
    private defaultBufferItemLifespan;
    constructor(config: CollectionConfig);
    isComplete(): boolean;
    private _addObject;
    addObject(key: string, object: any): void;
    getObject(key: string): any;
    hasKey(key: string): boolean;
    initialise(objects: any[]): void;
    objects(): any[];
    removeObject(key: string): void;
    replaceObject(key: string, object: any): void;
    protected checkObjectLifespans(): void;
}
