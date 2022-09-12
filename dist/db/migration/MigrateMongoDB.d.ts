import { DatabaseAvailableListener } from "mongo-access-jps";
import { Db } from "mongodb";
export declare class MigrateMongoDB implements DatabaseAvailableListener {
    private mongoDB;
    private configFileLocation;
    private dbLocation;
    constructor();
    databaseConnected(db: Db): void;
}
