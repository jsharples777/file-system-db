import debug from 'debug';
import {Collection} from "./collection/Collection";
import {SearchItem} from "./search/SearchTypes";
import {SortOrderItem} from "./sort/SortTypes";
import {View} from "./view/View";
import {ViewImpl} from "./view/ViewImpl";
import {DatabaseManagers} from "./DatabaseManagers";
import {CollectionListener} from "./collection/CollectionListener";
import fse from 'fs-extra';

const logger = debug('db');
require('dotenv').config();

export class FileSystemDB implements CollectionListener{
    private static _instance: FileSystemDB;
    // @ts-ignore
    private managers: DatabaseManagers;
    private isInitialised: boolean = false;
    private configLocation: string|undefined;
    private views: View[] = [];
    private bLogChanges: boolean = false;
    private isReplicating: boolean = false;
    private replicationDBs:FileSystemDB[] = [];
    private overrideConfigDBDir: string | undefined;
    private name: string;

    public constructor(name:string,configLocation?: string, overrideConfigDBDir?:string) {
        this.initialise = this.initialise.bind(this);
        this.shutdown = this.shutdown.bind(this);
        this.objectUpdated = this.objectUpdated.bind(this);
        this.objectAdded = this.objectAdded.bind(this);
        this.objectRemoved = this.objectRemoved.bind(this);
        this.name = name;
        this.configLocation = configLocation;
        this.overrideConfigDBDir = overrideConfigDBDir;
    }

    public static getInstance(configLocation?: string): FileSystemDB {
        if (!FileSystemDB._instance) {
            FileSystemDB._instance = new FileSystemDB('Singleton',configLocation);
        }
        return FileSystemDB._instance;
    }

    public initialise(): FileSystemDB {
        if (!this.isInitialised) {
            this.managers = new DatabaseManagers(this, this.configLocation, this.overrideConfigDBDir);
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
        logger(`${this.name} - Adding view for collection ${collection} with name ${name}`);
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
        this.bLogChanges = true;
        if (logFileLocation) {
            logger(`${this.name} - Logging changes to ${logFileLocation}`);
            this.managers.getLogFileManager().setLogLocation(logFileLocation);
            this.managers.getLifecycleManager().addLife(this.managers.getLogFileManager());
        }

    }

    public isLoggingChanges(): boolean {
        return this.bLogChanges;
    }

    public applyChangeLog(logFileLocation: string): void {
        this.managers.getLogFileManager().loadLogFile(logFileLocation);
        this.managers.getLogFileManager().heartbeat();
    }

    public addReplicationLocation(name:string, replicateToDir: string,replaceExistingContent:boolean): FileSystemDB {
        logger(`${this.name} - Adding replication location ${replicateToDir} and will overwrite current content? ${replaceExistingContent}`);
        const replicationDB = new FileSystemDB(name, this.configLocation,replicateToDir);
        this.replicationDBs.push(replicationDB);
        if (replaceExistingContent) {
            const dbLocation = this.managers.getConfig().dbLocation;
            fse.copySync(dbLocation,replicateToDir);
        }
        replicationDB.initialise();
        return replicationDB;
    }

    public startReplication(): void {
        this.isReplicating = true;
    }

    public stopReplication(): void {
        this.isReplicating = false;
    }

    objectAdded(collection: Collection, key: string, object: any): void {
        if (this.isReplicating) {
            logger(`${this.name} - Replicating object added to collection ${collection.getName()} with key ${key}`);
            this.replicationDBs.forEach((db) => {
                db.collection(collection.getName()).insertObject(key, object);
            })
        }
    }

    objectRemoved(collection: Collection, key: string): void {
        if (this.isReplicating) {
            logger(`${this.name} - Replicating object removed from collection ${collection.getName()} with key ${key}`);
            this.replicationDBs.forEach((db) => {
                db.collection(collection.getName()).removeObject(key);
            })
        }
    }

    objectUpdated(collection: Collection, key: string, object: any): void {
        if (this.isReplicating) {
            logger(`${this.name} - Replicating object updated in collection ${collection.getName()} with key ${key}`);
            this.replicationDBs.forEach((db) => {
                db.collection(collection.getName()).upsertObject(key, object);
            })
        }
    }

    removeAll(collection: Collection): void {
    }
}
