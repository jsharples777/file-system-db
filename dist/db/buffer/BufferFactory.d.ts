import { CollectionConfig } from "../config/Types";
import { ObjectBuffer } from "./ObjectBuffer";
export declare class BufferFactory {
    private static _instance;
    static getInstance(): BufferFactory;
    private constructor();
    createBuffer(config: CollectionConfig): ObjectBuffer;
}
