import {AbstractPartialBuffer} from "./AbstractPartialBuffer";
import {CollectionConfig} from "../config/Types";

export class FIFOBuffer extends AbstractPartialBuffer {
    constructor(config:CollectionConfig) {
        super(config);
    }
}
