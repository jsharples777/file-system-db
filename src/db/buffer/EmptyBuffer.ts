import {ObjectBuffer} from "./ObjectBuffer";

export class EmptyBuffer implements ObjectBuffer {
    addObject(key: string, object: any): void {
    }

    getObject(key: string): any {
        return null;
    }

    hasKey(key: string): boolean {
        return false;
    }

    objects(): any[] {
        return [];
    }

    removeObject(key: string): void {
    }

    replaceObject(key: string, object: any): void {
    }

    initialise(objects: any[]): void {
    }

    isComplete(): boolean {
        return false;
    }

}
