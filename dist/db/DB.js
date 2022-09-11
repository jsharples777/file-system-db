"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const ConfigManager_1 = require("./ConfigManager");
const debug_1 = __importDefault(require("debug"));
const CollectionManager_1 = require("./collection/CollectionManager");
const IndexManager_1 = require("./index/IndexManager");
const CollectionFileManager_1 = require("./collection/CollectionFileManager");
const IndexFileManager_1 = require("./index/IndexFileManager");
const logger = (0, debug_1.default)('db');
require('dotenv').config();
class DB {
    constructor() {
        this.isInitialised = false;
        this.initialise = this.initialise.bind(this);
    }
    static getInstance() {
        if (!DB._instance) {
            DB._instance = new DB();
        }
        return DB._instance;
    }
    static copyObject(object) {
        let result = undefined;
        if (object) {
            result = JSON.parse(JSON.stringify(object));
        }
        return result;
    }
    static getFieldValue(entry, field) {
        let result = undefined;
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
        }
        else {
            result = entry[field];
        }
        return result;
    }
    initialise() {
        if (!this.isInitialised) {
            const configLocation = process.env.FILE_SYSTEM_DB_CONFIG || 'cfg/config.json';
            const config = ConfigManager_1.ConfigManager.getInstance().loadConfig(configLocation);
            CollectionFileManager_1.CollectionFileManager.getInstance().loadConfig(config);
            CollectionManager_1.CollectionManager.getInstance().loadConfig(config);
            IndexFileManager_1.IndexFileManager.getInstance().loadConfig(config);
            IndexManager_1.IndexManager.getInstance().loadConfig(config);
            this.isInitialised = true;
        }
        return this;
    }
    collections() {
        return CollectionManager_1.CollectionManager.getInstance().collections();
    }
    collection(name) {
        return CollectionManager_1.CollectionManager.getInstance().getCollection(name);
    }
}
exports.DB = DB;
//# sourceMappingURL=DB.js.map