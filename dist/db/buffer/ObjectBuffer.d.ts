export declare type BufferEntry = {
    key: string;
    lastUsed: number;
    timeToDie: number;
    content: any;
};
export interface ObjectBuffer {
    hasKey(key: string): boolean;
    getObject(key: string): any | null;
    addObject(key: string, object: any): void;
    removeObject(key: string): void;
    replaceObject(key: string, object: any): void;
    objects(): any[];
    initialise(objects: any[]): void;
    isComplete(): boolean;
    clear(): void;
}
