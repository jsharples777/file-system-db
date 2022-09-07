import { CollectionConfig } from "../Types";
import { AbstractPartialBuffer } from "./AbstractPartialBuffer";
export declare class CompleteBuffer extends AbstractPartialBuffer {
    constructor(config: CollectionConfig);
    isComplete(): boolean;
}
