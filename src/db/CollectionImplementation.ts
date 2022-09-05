import {Collection} from "./Collection";
import {CollectionConfig} from "./Types";

export class CollectionImplementation implements Collection {
    private config:CollectionConfig;

    constructor(config:CollectionConfig) {
        this.config = config;
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
