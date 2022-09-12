import {ConfigManager} from "./config/ConfigManager";
import debug from 'debug';
import {CollectionManager} from "./collection/CollectionManager";
import {IndexManager} from "./index/IndexManager";
import {Collection} from "./collection/Collection";
import {CollectionFileManager} from "./collection/CollectionFileManager";
import {IndexFileManager} from "./index/IndexFileManager";
import {LifeCycleManager} from "./life/LifeCycleManager";
import {SearchItem} from "./search/SearchTypes";
import {SortOrderItem} from "./sort/SortTypes";
import {ObjectView} from "./view/ObjectView";
import {ObjectViewImpl} from "./view/ObjectViewImpl";

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





    private isInitialised:boolean = false;
    private views:ObjectView[] = [];

    private constructor(){
        this.initialise = this.initialise.bind(this);
        this.shutdown = this.shutdown.bind(this);
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

            process.on('SIGINT', () => {
                this.shutdown();
            });
        }
        return this;

    }

    public collections():string[] {
        return CollectionManager.getInstance().collections();
    }

    public collection(name:string):Collection {
        return CollectionManager.getInstance().getCollection(name);
    }

    protected shutdown():void {
        LifeCycleManager.getInstance().death();
    }

    public addView(collection:string, name:string, fields:string[], search?:SearchItem[], sort?:SortOrderItem[]):ObjectView {
        const view = new ObjectViewImpl(collection,name,fields,search, sort);
        this.views.push(view);
        return view;
    }

    public getView(name:string):ObjectView|null {
        let result:ObjectView|null = null;
        const foundIndex = this.views.findIndex((view) => view.getName() === name);
        if (foundIndex >= 0) {
            result = this.views[foundIndex];
        }

        return result;
    }
}
