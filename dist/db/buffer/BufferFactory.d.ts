import { CollectionConfig } from "../config/Types";
import { ObjectBuffer } from "./ObjectBuffer";
import { LifeCycleManager } from "../life/LifeCycleManager";
export declare class BufferFactory {
    private static _instance;
    private constructor();
    static getInstance(): BufferFactory;
    createBuffer(config: CollectionConfig, lifeManager: LifeCycleManager): ObjectBuffer;
}
