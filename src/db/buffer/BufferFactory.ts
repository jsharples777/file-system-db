import debug from 'debug';
import {BufferType, CollectionConfig} from "../config/Types";
import {ObjectBuffer} from "./ObjectBuffer";
import {EmptyBuffer} from "./EmptyBuffer";
import {CompleteBuffer} from "./CompleteBuffer";
import {LifespanBuffer} from "./LifespanBuffer";
import {FIFOBuffer} from "./FIFOBuffer";
import {LifeCycleManager} from "../life/LifeCycleManager";

const logger = debug('buffer-factory');

export class BufferFactory {
    private static _instance: BufferFactory;
    public static getInstance(): BufferFactory {
        if (!BufferFactory._instance) {
            BufferFactory._instance = new BufferFactory();
        }
        return BufferFactory._instance;
    }


    private constructor(){
    }

    public createBuffer(config:CollectionConfig, lifeManager:LifeCycleManager):ObjectBuffer {
        let result:ObjectBuffer;
        switch (config.bufferType) {
            case BufferType.NONE: {
                result = new EmptyBuffer();
                break;
            }
            case BufferType.ALL: {
                result = new CompleteBuffer(config);
                break;
            }
            case BufferType.FIFO: {
                result = new FIFOBuffer(config);
                break;
            }
            case BufferType.LIFESPAN: {
                result = new LifespanBuffer(config,lifeManager);
                break;
            }
        }
        return result;
    }

}
