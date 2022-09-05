import * as fs from "fs";
import {DBConfig, InvalidConfiguration, MissingConfiguration} from "./Types";
import debug from 'debug';
import {Configurable} from "./Configurable";

const logger = debug('config-manager');

export class ConfigManager {
    private static _instance: ConfigManager;
    public static getInstance(): ConfigManager {
        if (!ConfigManager._instance) {
            ConfigManager._instance = new ConfigManager();
        }
        return ConfigManager._instance;
    }
    private constructor(){}

    public loadConfig(configLocation:string):DBConfig {
        let result:DBConfig;

        if (fs.existsSync(configLocation)) {
            logger(`Loading configuration from ${configLocation}`);
            const configurationJSON = fs.readFileSync(configLocation);
            try {
                result = <DBConfig>JSON.parse(configurationJSON.toString());
            }
            catch (err) {
                throw new InvalidConfiguration(configLocation);
            }                // check the configuration
            if (result.dbLocation) {
                if (!fs.existsSync(result.dbLocation)) {
                    logger(`Creating database location ${result.dbLocation}`);
                    fs.mkdirSync(result.dbLocation);
                }
            }
            else {
                throw new InvalidConfiguration('Configuration missing DB Location');
            }

            if (result.collections) {
                result.collections.forEach((collection) => {
                    if (collection.name) {
                        if (collection.key) {
                            if (collection.bufferType !== undefined) {
                                if (collection.entryFileType !== undefined) {
                                    const collectionDir = `${result.dbLocation}/${collection.name}`;
                                    logger(`Found collection ${collection.name} at ${collectionDir}`);
                                    if (!fs.existsSync(collectionDir)) {
                                        fs.mkdirSync(collectionDir);
                                    }
                                }
                                else {
                                    throw new InvalidConfiguration(`Collection ${collection.name} missing entry file type`);
                                }

                            }
                            else {
                                throw new InvalidConfiguration(`Collection ${collection.name} missing buffer type`);
                            }

                        }
                        else {
                            throw new InvalidConfiguration(`Collection ${collection.name} missing key`);
                        }
                    }
                    else {
                        throw new InvalidConfiguration(`Collection missing name`);
                    }
                })
            }
            else {
                throw new InvalidConfiguration(`No collections in database`);
            }

            if (result.indexes) {
                result.indexes.forEach((index) => {
                    if (index.name) {
                        if (index.collection) {
                            if (index.fields) {
                                // ensure collection exists
                                const foundIndex = result.collections.findIndex((collection) => collection.name === index.collection);
                                if (foundIndex < 0) {
                                    throw new InvalidConfiguration(`Index ${index.name} references collection ${index.collection} which is not configured`);
                                }
                                else {
                                    logger(`Found index ${index.name} for collection ${index.collection} with fields ${index.fields}`);
                                }
                            }
                            else {
                                throw new InvalidConfiguration(`Index ${index.name} missing fields`);
                            }
                        }
                        else {
                            throw new InvalidConfiguration(`Index ${index.name} missing collection`);
                        }
                    }
                    else {
                        throw new InvalidConfiguration('Index missing name');
                    }
                })
            }





        }
        else {
            logger(`${configLocation} does not exist at ${process.cwd()}`);
            throw new MissingConfiguration(configLocation);
        }

        return result;
    }
}
