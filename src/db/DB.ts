import {ConfigManager} from "./config/ConfigManager";
import debug from 'debug';
import {CollectionManager} from "./collection/CollectionManager";
import {IndexManager} from "./index/IndexManager";
import {Collection} from "./collection/Collection";
import {CollectionFileManager} from "./collection/CollectionFileManager";
import {IndexFileManager} from "./index/IndexFileManager";
import {LifeCycleManager} from "./life/LifeCycleManager";

const logger = debug('db');
require('dotenv').config();

export class DB {
    private static _instance: DB;
    public static getInstance(): DB {
        if (!DB._instance) {
            DB._instance = new DB();
        }
        return DB._instance;
    }

    public static copyObject(object:any):any {
        let result = undefined;
        if (object) {
            result = JSON.parse(JSON.stringify(object));
        }
        return result;
    }

    public static getFieldValue(entry: any, field: string): any | undefined {
        let result: any | undefined = undefined;
        // any dot notation?
        const fieldParts = field.split('.');
        if (fieldParts.length > 1) {
            let previousValue = entry;
            fieldParts.forEach((fieldPart, index) => {
                if (previousValue) {
                    previousValue = previousValue[fieldPart];
                    if (index === (fieldParts.length - 1)) {
                        if (previousValue) {
                            result = previousValue;
                        }
                    }
                }
            });

        } else {
            result = entry[field];
        }
        return result;
    }

    private isInitialised:boolean = false;

    private constructor(){
        this.initialise = this.initialise.bind(this);
    }

    public initialise():DB {
        if (!this.isInitialised) {
            const configLocation = process.env.FILE_SYSTEM_DB_CONFIG || 'cfg/config.json';
            const config = ConfigManager.getInstance().loadConfig(configLocation);
            CollectionFileManager.getInstance().loadConfig(config);
            CollectionManager.getInstance().loadConfig(config);
            IndexFileManager.getInstance().loadConfig(config);
            IndexManager.getInstance().loadConfig(config);

            const lifecycleManger = LifeCycleManager.getInstance();
            lifecycleManger.addLife(CollectionFileManager.getInstance());
            lifecycleManger.addLife(IndexFileManager.getInstance());
            lifecycleManger.birth();
            this.isInitialised = true;
        }
        return this;

    }

    public collections():string[] {
        return CollectionManager.getInstance().collections();
    }

    public collection(name:string):Collection {
        return CollectionManager.getInstance().getCollection(name);
    }



}
