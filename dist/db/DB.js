"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const ConfigManager_1 = require("./ConfigManager");
const debug_1 = __importDefault(require("debug"));
const CollectionManager_1 = require("./CollectionManager");
const IndexManager_1 = require("./IndexManager");
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
    initialise() {
        if (!this.isInitialised) {
            const configLocation = process.env.FILE_SYSTEM_DB_CONFIG || 'cfg/config.json';
            const config = ConfigManager_1.ConfigManager.getInstance().loadConfig(configLocation);
            CollectionManager_1.CollectionManager.getInstance().loadConfig(config);
            IndexManager_1.IndexManager.getInstance().loadConfig(config);
            this.isInitialised = true;
        }
        return this;
    }
    collections() {
        return CollectionManager_1.CollectionManager.getInstance().collections();
    }
    getCollection(name) {
        return CollectionManager_1.CollectionManager.getInstance().getCollection(name);
    }
}
exports.DB = DB;
//# sourceMappingURL=DB.js.map