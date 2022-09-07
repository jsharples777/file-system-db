"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const Types_1 = require("./Types");
const debug_1 = __importDefault(require("debug"));
const logger = (0, debug_1.default)('config-manager');
class ConfigManager {
    constructor() { }
    static getInstance() {
        if (!ConfigManager._instance) {
            ConfigManager._instance = new ConfigManager();
        }
        return ConfigManager._instance;
    }
    loadConfig(configLocation) {
        let result;
        if (fs.existsSync(configLocation)) {
            logger(`Loading configuration from ${configLocation}`);
            const configurationJSON = fs.readFileSync(configLocation);
            try {
                result = JSON.parse(configurationJSON.toString());
            }
            catch (err) {
                throw new Types_1.InvalidConfiguration(configLocation);
            } // check the configuration
            if (result.dbLocation) {
                if (!fs.existsSync(result.dbLocation)) {
                    logger(`Creating database location ${result.dbLocation}`);
                    fs.mkdirSync(result.dbLocation);
                }
            }
            else {
                throw new Types_1.InvalidConfiguration('Configuration missing DB Location');
            }
            if (result.collections) {
                result.collections.forEach((collection) => {
                    if (collection.name) {
                        if (collection.key) {
                            if (collection.bufferType !== undefined) {
                                const collectionDir = `${result.dbLocation}/${collection.name}`;
                                logger(`Found collection ${collection.name} at ${collectionDir}`);
                                if (!fs.existsSync(collectionDir)) {
                                    fs.mkdirSync(collectionDir);
                                }
                            }
                            else {
                                throw new Types_1.InvalidConfiguration(`Collection ${collection.name} missing buffer type`);
                            }
                        }
                        else {
                            throw new Types_1.InvalidConfiguration(`Collection ${collection.name} missing key`);
                        }
                    }
                    else {
                        throw new Types_1.InvalidConfiguration(`Collection missing name`);
                    }
                });
            }
            else {
                throw new Types_1.InvalidConfiguration(`No collections in database`);
            }
            if (result.indexes) {
                result.indexes.forEach((index) => {
                    if (index.name) {
                        if (index.collection) {
                            if (index.fields) {
                                // ensure collection exists
                                const foundIndex = result.collections.findIndex((collection) => collection.name === index.collection);
                                if (foundIndex < 0) {
                                    throw new Types_1.InvalidConfiguration(`Index ${index.name} references collection ${index.collection} which is not configured`);
                                }
                                else {
                                    logger(`Found index ${index.name} for collection ${index.collection} with fields ${index.fields}`);
                                }
                            }
                            else {
                                throw new Types_1.InvalidConfiguration(`Index ${index.name} missing fields`);
                            }
                        }
                        else {
                            throw new Types_1.InvalidConfiguration(`Index ${index.name} missing collection`);
                        }
                    }
                    else {
                        throw new Types_1.InvalidConfiguration('Index missing name');
                    }
                });
            }
        }
        else {
            logger(`${configLocation} does not exist at ${process.cwd()}`);
            throw new Types_1.MissingConfiguration(configLocation);
        }
        return result;
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map