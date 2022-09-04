import {Collection} from "./Collection";
import {CollectionVersion} from "./Types";

export class CollectionImplementation implements Collection {
    private versionConfig:CollectionVersion;

    constructor(versionConfig:CollectionVersion) {
        this.versionConfig = versionConfig;
    }

    getVersion(): number {
        return this.versionConfig.version;
    }

    getName(): string {
        return this.versionConfig.name;
    }



}
