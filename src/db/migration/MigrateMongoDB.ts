import {DatabaseAvailableListener, MongoDataSource} from "mongo-access-jps";
import {Db} from "mongodb";
import * as fs from "fs";
import {BufferType, DBConfig} from "../config/Types";
import {FileSystemDB} from "../FileSystemDB";

export class MigrateMongoDB implements DatabaseAvailableListener {
    private mongoDB: MongoDataSource;
    private configFileLocation: string;
    private dbLocation: string;


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
        this.mongoDB = new MongoDataSource(db1).addListener(this);
        this.mongoDB.initialise();
    }

    databaseConnected(db: Db): void {
        const dbConfig: DBConfig = {
            dbLocation: this.dbLocation,
            collections: [],
            indexes: []
        }
        this.mongoDB.getDatabase().collections().then((collections) => {
            collections.forEach((collection) => {
                dbConfig.collections.push({
                    bufferType: BufferType.ALL, key: "_id", name: collection.collectionName, version: 0
                });
            });

            // write the config file
            fs.writeFileSync(this.configFileLocation, JSON.stringify(dbConfig));

            // now load the configuration into the file system database
            const fileSystemDB = FileSystemDB.getInstance(this.configFileLocation).initialise();

            collections.forEach((collection) => {
                this.mongoDB.getDatabase().collection(collection.collectionName).find({}).toArray().then((fullCollection) => {
                    console.log(`Copying ${collection.collectionName}`);
                    if (fullCollection.length > 0) {
                        const fsCollection = fileSystemDB.collection(collection.collectionName);
                        fullCollection.forEach((document) => {
                            fsCollection.upsertObject(document._id + '', document);
                        });
                    }
                })
            });

        });
    }
}


