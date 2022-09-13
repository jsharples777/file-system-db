import { AbstractPartialBuffer } from "./AbstractPartialBuffer";
import { CollectionConfig } from "../config/Types";
import { LifeCycleManager } from "../life/LifeCycleManager";
export declare class LifespanBuffer extends AbstractPartialBuffer {
    constructor(config: CollectionConfig, lifeManager: LifeCycleManager);
}
