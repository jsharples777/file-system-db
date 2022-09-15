import debug from 'debug';
import {Collection} from "./collection/Collection";
import {SearchItem} from "./search/SearchTypes";
import {SortOrderItem} from "./sort/SortTypes";
import {View} from "./view/View";
import {ViewImpl} from "./view/ViewImpl";
import {DatabaseManagers} from "./DatabaseManagers";
import {QueryImpl} from "./query/QueryImpl";
import {Query} from "./query/Query";

const logger = debug('db');
require('dotenv').config();

export class FileSystemDB {
    private static _instance: FileSystemDB;
    // @ts-ignore
    private managers: DatabaseManagers;
    private isInitialised: boolean = false;
    private configLocation?: string = undefined;
    private views: View[] = [];

    public constructor(configLocation?: string) {
        this.initialise = this.initialise.bind(this);
        this.shutdown = this.shutdown.bind(this);
        this.configLocation = configLocation;
    }

    public static getInstance(configLocation?: string): FileSystemDB {
        if (!FileSystemDB._instance) {
            FileSystemDB._instance = new FileSystemDB(configLocation);
        }
        return FileSystemDB._instance;
    }

    public initialise(): FileSystemDB {
        if (!this.isInitialised) {
            this.managers = new DatabaseManagers(this, this.configLocation);
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

    public addView(collection: string, name: string, fields: string[], search?: SearchItem[], sort?: SortOrderItem[]): View {
        const view = new ViewImpl(this.managers, collection, name, fields, search, sort);
        this.views.push(view);
        return view;
    }

    public getView(name: string): View | null {
        let result: View | null = null;
        const foundIndex = this.views.findIndex((view) => view.getName() === name);
        if (foundIndex >= 0) {
            result = this.views[foundIndex];
        }
        return result;
    }

    public logChanges(logFileLocation?: string): void {

    }

    public isLoggingChanges(): boolean {
        return false;
    }

    public applyChangeLog(logFileLocation?: string): void {

    }

    public addReplicationLocation(replicateToDir: string): void {

    }

    public startReplication(): void {
    }

    public stopReplication(): void {
    }


}
