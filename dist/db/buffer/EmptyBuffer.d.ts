import { ObjectBuffer } from "./ObjectBuffer";
export declare class EmptyBuffer implements ObjectBuffer {
    addObject(key: string, object: any): void;
    getObject(key: string): any;
    hasKey(key: string): boolean;
    objects(): any[];
    removeObject(key: string): void;
    replaceObject(key: string, object: any): void;
    initialise(objects: any[]): void;
    isComplete(): boolean;
    clear(): void;
}
