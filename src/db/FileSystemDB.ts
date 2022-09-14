import debug from 'debug';
import {CollectionManager} from "./collection/CollectionManager";
import {Collection} from "./collection/Collection";
import {LifeCycleManager} from "./life/LifeCycleManager";
import {SearchItem} from "./search/SearchTypes";
import {SortOrderItem} from "./sort/SortTypes";
import {ObjectView} from "./view/ObjectView";
import {ObjectViewImpl} from "./view/ObjectViewImpl";
import {DatabaseManagers} from "./DatabaseManagers";

const logger = debug('db');
require('dotenv').config();

export class FileSystemDB {
    private static _instance: FileSystemDB;
    // @ts-ignore
    private managers: DatabaseManagers;

    public static getInstance(configLocation?: string): FileSystemDB {
        if (!FileSystemDB._instance) {
            FileSystemDB._instance = new FileSystemDB(configLocation);
        }
        return FileSystemDB._instance;
    }


    private isInitialised: boolean = false;
    private configLocation?: string = undefined;
    private views: ObjectView[] = [];

    public constructor(configLocation?: string) {
        this.initialise = this.initialise.bind(this);
        this.shutdown = this.shutdown.bind(this);
        this.configLocation = configLocation;
    }

    public initialise(): FileSystemDB {
        if (!this.isInitialised) {
            this.managers = new DatabaseManagers(this.configLocation);
            this.isInitialised = true;
        }
        return this;

    }

    public collections(): string[] {
        return this.managers.getCollectionManager().collections();
    }

    public collection(name: string): Collection {
        return this.managers.getCollectionManager().getCollection(name);
    }

    public shutdown(): void {
        this.managers.getLifecycleManager().death();
    }

    public addView(collection: string, name: string, fields: string[], search?: SearchItem[], sort?: SortOrderItem[]): ObjectView {
        const view = new ObjectViewImpl(this.managers,collection, name, fields, search, sort);
        this.views.push(view);
        return view;
    }

    public getView(name: string): ObjectView | null {
        let result: ObjectView | null = null;
        const foundIndex = this.views.findIndex((view) => view.getName() === name);
        if (foundIndex >= 0) {
            result = this.views[foundIndex];
        }

        return result;
    }
}
