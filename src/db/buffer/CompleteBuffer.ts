import {CollectionConfig} from "../Types";
import debug from 'debug'
import {AbstractPartialBuffer} from "./AbstractPartialBuffer";

const logger = debug('complete-buffer');

export class CompleteBuffer extends AbstractPartialBuffer {

    constructor(config: CollectionConfig) {
        super(config);
        this.isComplete = this.isComplete.bind(this);
    }

    isComplete(): boolean {
        return true;
    }


}
