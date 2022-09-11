import {AbstractPartialBuffer} from "./AbstractPartialBuffer";
import {CollectionConfig} from "../config/Types";

export class LifespanBuffer extends AbstractPartialBuffer {
    constructor(config:CollectionConfig) {
        super(config);
    }
}
