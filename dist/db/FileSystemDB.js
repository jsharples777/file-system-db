"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemDB = void 0;
const debug_1 = __importDefault(require("debug"));
const ViewImpl_1 = require("./view/ViewImpl");
const DatabaseManagers_1 = require("./DatabaseManagers");
const fs_extra_1 = __importDefault(require("fs-extra"));
const logger = (0, debug_1.default)('db');
require('dotenv').config();
class FileSystemDB {
    constructor(name, configLocation, overrideConfigDBDir) {
        this.isInitialised = false;
        this.views = [];
        this.bLogChanges = false;
        this.isReplicating = false;
        this.replicationDBs = [];
        this.initialise = this.initialise.bind(this);
        this.shutdown = this.shutdown.bind(this);
        this.objectUpdated = this.objectUpdated.bind(this);
        this.objectAdded = this.objectAdded.bind(this);
        this.objectRemoved = this.objectRemoved.bind(this);
        this.name = name;
        this.configLocation = configLocation;
        this.overrideConfigDBDir = overrideConfigDBDir;
    }
    static getInstance(configLocation) {
        if (!FileSystemDB._instance) {
            FileSystemDB._instance = new FileSystemDB('Singleton', configLocation);
        }
        return FileSystemDB._instance;
    }
    initialise() {
        if (!this.isInitialised) {
            this.managers = new DatabaseManagers_1.DatabaseManagers(this, this.configLocation, this.overrideConfigDBDir);
            this.isInitialised = true;
        }
        return this;
    }
    collections() {
        return this.managers.getCollectionManager().collections();
    }
    collection(name) {
        return this.managers.getCollectionManager().getCollection(name);
    }
    shutdown() {
        this.managers.getLifecycleManager().death();
    }
    addView(collection, name, fields, search, sort) {
        logger(`${this.name} - Adding view for collection ${collection} with name ${name}`);
        const view = new ViewImpl_1.ViewImpl(this.managers, collection, name, fields, search, sort);
        this.views.push(view);
        return view;
    }
    getView(name) {
        let result = null;
        const foundIndex = this.views.findIndex((view) => view.getName() === name);
        if (foundIndex >= 0) {
            result = this.views[foundIndex];
        }
        return result;
    }
    logChanges(logFileLocation) {
        this.bLogChanges = true;
        if (logFileLocation) {
            logger(`${this.name} - Logging changes to ${logFileLocation}`);
            this.managers.getLogFileManager().setLogLocation(logFileLocation);
            this.managers.getLifecycleManager().addLife(this.managers.getLogFileManager());
        }
    }
    isLoggingChanges() {
        return this.bLogChanges;
    }
    applyChangeLog(logFileLocation) {
        this.managers.getLogFileManager().loadLogFile(logFileLocation);
        this.managers.getLogFileManager().heartbeat();
    }
    addReplicationLocation(name, replicateToDir, replaceExistingContent) {
        logger(`${this.name} - Adding replication location ${replicateToDir} and will overwrite current content? ${replaceExistingContent}`);
        const replicationDB = new FileSystemDB(name, this.configLocation, replicateToDir);
        this.replicationDBs.push(replicationDB);
        if (replaceExistingContent) {
            const dbLocation = this.managers.getConfig().dbLocation;
            fs_extra_1.default.copySync(dbLocation, replicateToDir);
        }
        replicationDB.initialise();
        return replicationDB;
    }
    startReplication() {
        this.isReplicating = true;
    }
    stopReplication() {
        this.isReplicating = false;
    }
    objectAdded(collection, key, object) {
        if (this.isReplicating) {
            logger(`${this.name} - Replicating object added to collection ${collection.getName()} with key ${key}`);
            this.replicationDBs.forEach((db) => {
                db.collection(collection.getName()).insertObject(key, object);
            });
        }
    }
    objectRemoved(collection, key) {
        if (this.isReplicating) {
            logger(`${this.name} - Replicating object removed from collection ${collection.getName()} with key ${key}`);
            this.replicationDBs.forEach((db) => {
                db.collection(collection.getName()).removeObject(key);
            });
        }
    }
    objectUpdated(collection, key, object) {
        if (this.isReplicating) {
            logger(`${this.name} - Replicating object updated in collection ${collection.getName()} with key ${key}`);
            this.replicationDBs.forEach((db) => {
                db.collection(collection.getName()).upsertObject(key, object);
            });
        }
    }
    removeAll(collection) {
    }
}
exports.FileSystemDB = FileSystemDB;
//# sourceMappingURL=FileSystemDB.js.map