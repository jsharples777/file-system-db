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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateMongoDB = void 0;
const mongo_access_jps_1 = require("mongo-access-jps");
const fs = __importStar(require("fs"));
const Types_1 = require("../config/Types");
const DB_1 = require("../DB");
class MigrateMongoDB {
    constructor() {
        // connect to the two databases
        const db1 = process.env.DB_URL || 'mongodb://localhost/default';
        this.configFileLocation = './cfg/migration.json';
        if (!fs.existsSync('./cfg')) {
            fs.mkdirSync('./cfg');
        }
        this.dbLocation = './migration-db';
        if (!fs.existsSync(this.dbLocation)) {
            fs.mkdirSync(this.dbLocation);
        }
        this.mongoDB = new mongo_access_jps_1.MongoDataSource(db1).addListener(this);
        this.mongoDB.initialise();
    }
    databaseConnected(db) {
        const dbConfig = {
            dbLocation: this.dbLocation,
            collections: [],
            indexes: []
        };
        this.mongoDB.getDatabase().collections().then((collections) => {
            collections.forEach((collection) => {
                dbConfig.collections.push({
                    bufferType: Types_1.BufferType.ALL, key: "_id", name: collection.collectionName, version: 0
                });
            });
            // write the config file
            fs.writeFileSync(this.configFileLocation, JSON.stringify(dbConfig));
            // now load the configuration into the file system database
            const fileSystemDB = DB_1.DB.getInstance(this.configFileLocation).initialise();
            collections.forEach((collection) => {
                this.mongoDB.getDatabase().collection(collection.collectionName).find({}).toArray().then((fullCollection) => {
                    console.log(`Copying ${collection.collectionName}`);
                    if (fullCollection.length > 0) {
                        const fsCollection = fileSystemDB.collection(collection.collectionName);
                        fullCollection.forEach((document) => {
                            fsCollection.upsertObject(document._id + '', document);
                        });
                    }
                });
            });
        });
    }
}
exports.MigrateMongoDB = MigrateMongoDB;
//# sourceMappingURL=MigrateMongoDB.js.map