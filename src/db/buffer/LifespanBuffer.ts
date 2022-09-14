import {AbstractPartialBuffer} from "./AbstractPartialBuffer";
import {CollectionConfig} from "../config/Types";
import {LifeCycleManager} from "../life/LifeCycleManager";

export class LifespanBuffer extends AbstractPartialBuffer {
    constructor(config: CollectionConfig, lifeManager: LifeCycleManager) {
        super(config, lifeManager);
    }
}
