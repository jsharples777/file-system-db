import debug from 'debug';
import {Configurable} from "../config/Configurable";
import {BufferType, CollectionConfig, DBConfig} from "../config/Types";
import fs from "fs";
import {Collection} from "./Collection";
import {CollectionImpl} from "./CollectionImpl";
import {CollectionFileManager} from "./CollectionFileManager";
import {DatabaseManagers} from "../DatabaseManagers";

const logger = debug('collection-manager');

export class CollectionManager implements Configurable{
    private config: DBConfig | undefined;
    private collectionConfigs:CollectionConfig[] = [];
    private collectionImplementations:CollectionImpl[] = [];
    private managers: DatabaseManagers;
    public constructor(managers:DatabaseManagers){
        this.managers = managers;
    }

    private setupCollection(name:string):CollectionConfig {
        logger(`Setting up collection ${name}`);
        let result:CollectionConfig = {
            bufferSize: 0,
            bufferType: BufferType.NONE,
            key: "_id",
            version:1,
            name:name
        }

        const foundIndex = this.collectionConfigs.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            result = this.collectionConfigs[foundIndex];
        }



        const collectionDir = `${this.config?.dbLocation}/${name}`;
        if (!fs.existsSync(collectionDir)) {
            logger(`Setting up collection ${name} - making collection directory ${collectionDir}`);
            fs.mkdirSync(collectionDir);
        }

        const versionFileName = `${this.config?.dbLocation}/${name}/${name}.vrs`;
        if (!fs.existsSync(versionFileName)) {
            logger(`Setting up collection ${name} - making collection version file`);
            fs.writeFileSync(versionFileName,JSON.stringify(result));
        }
        else {
            const buffer = fs.readFileSync(versionFileName);
            logger(`Setting up collection ${name} - loading existing collection version file`);
            result = <CollectionConfig>JSON.parse(buffer.toString());
        }

        logger(result);
        return result;
    }

    loadConfig(config: DBConfig): void {
        this.config = config;

        // check on each collection version file
        this.config.collections.forEach((collection) => {
            //const config = this.setupCollection(collection.name);
            this.collectionConfigs.push(collection);
        });
    }

    public collections():string[] {
        let results:string[] = [];
        this.collectionConfigs.forEach((collection) => {
            results.push(collection.name);
        })
        return results;
    }

    public getCollection(name:string):Collection {
        let result:Collection;

        const foundIndex = this.collectionImplementations.findIndex((collection) => collection.getName() === name);
        if (foundIndex >= 0) {
            result = this.collectionImplementations[foundIndex];
        }
        else {
            const foundConfigIndex = this.collectionConfigs.findIndex((config) => config.name === name);
            let config:CollectionConfig;
            if (foundConfigIndex >= 0) {
                config = this.collectionConfigs[foundConfigIndex];
            }
            else {
                config = {
                    bufferType: BufferType.ALL,
                    key: "_id",
                    name: name,
                    version: 0
                }
            }
            const impl = new CollectionImpl(config,this.managers);
            this.collectionImplementations.push(impl);
            impl.addListener(this.managers.getCollectionFileManager());
            result = impl;
        }
        return result;
    }
}
