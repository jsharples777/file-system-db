import {Collection} from "./Collection";
import {CollectionConfig} from "./Types";
import {ObjectBuffer} from "./buffer/ObjectBuffer";
import {BufferFactory} from "./buffer/BufferFactory";

export class CollectionImplementation implements Collection {
    private config:CollectionConfig;
    private buffer:ObjectBuffer;

    constructor(config:CollectionConfig) {
        this.config = config;
        this.buffer = BufferFactory.getInstance().createBuffer(config);
    }

    getVersion(): number {
        return this.config.version;
    }

    getName(): string {
        return this.config.name;
    }

    find(): any[] {
        return [];
    }

}
