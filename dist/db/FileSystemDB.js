"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemDB = void 0;
const debug_1 = __importDefault(require("debug"));
const ViewImpl_1 = require("./view/ViewImpl");
const DatabaseManagers_1 = require("./DatabaseManagers");
const logger = (0, debug_1.default)('db');
require('dotenv').config();
class FileSystemDB {
    constructor(configLocation) {
        this.isInitialised = false;
        this.configLocation = undefined;
        this.views = [];
        this.bLogChanges = false;
        this.initialise = this.initialise.bind(this);
        this.shutdown = this.shutdown.bind(this);
        this.configLocation = configLocation;
    }
    static getInstance(configLocation) {
        if (!FileSystemDB._instance) {
            FileSystemDB._instance = new FileSystemDB(configLocation);
        }
        return FileSystemDB._instance;
    }
    initialise() {
        if (!this.isInitialised) {
            this.managers = new DatabaseManagers_1.DatabaseManagers(this, this.configLocation);
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
    addReplicationLocation(replicateToDir) {
    }
    startReplication() {
    }
    stopReplication() {
    }
}
exports.FileSystemDB = FileSystemDB;
//# sourceMappingURL=FileSystemDB.js.map