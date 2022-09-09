import {ConfigManager} from "./ConfigManager";
import debug from 'debug';
import {CollectionManager} from "./collection/CollectionManager";
import {IndexManager} from "./index/IndexManager";
import {Collection} from "./collection/Collection";
import {CollectionFileManager} from "./collection/CollectionFileManager";
import {IndexFileManager} from "./index/IndexFileManager";

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
            this.isInitialised = true;
        }
        return this;

    }

    public collections():string[] {
        return CollectionManager.getInstance().collections();
    }

    public getCollection(name:string):Collection {
        return CollectionManager.getInstance().getCollection(name);
    }



}
