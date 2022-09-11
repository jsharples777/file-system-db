import { CollectionConfig } from "../config/Types";
import { AbstractPartialBuffer } from "./AbstractPartialBuffer";
export declare class CompleteBuffer extends AbstractPartialBuffer {
    constructor(config: CollectionConfig);
    isComplete(): boolean;
}
