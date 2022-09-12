import debug from 'debug';
import {Configurable} from "../config/Configurable";
import {DBConfig, IndexConfig} from "../config/Types";
import {Index} from "./Index";
import {IndexImplementation} from "./IndexImplementation";
import {SearchItem} from "../search/SearchTypes";
import {CollectionManager} from "../collection/CollectionManager";
import {DatabaseManagers} from "../DatabaseManagers";


const logger = debug('index-manager');

export class IndexManager implements Configurable {


    private config: DBConfig | undefined;
    private indexes:Index[] = [];
    private managers: DatabaseManagers;

    public constructor(managers:DatabaseManagers) {
        this.managers = managers;
    }

    public getMatchingIndex(collection:string,search:SearchItem[]):Index|null {
        logger(`Looking for index for collection ${collection} for search criteria`);
        logger(search);

        let result:Index|null = null;
        // look for full matches first
        this.indexes.every((index) => {
            if (collection === index.getCollection()) { // matches collection
                const fullMatch = index.matchesFilter(search);
                if (fullMatch) {
                    logger(`Looking for index for collection ${collection} for search criteria, found full match index ${index.getName()}`);
                    result = index;
                    return false;
                }
            }
            return true;
        });

        if (!result) {
            // look for partial matches next
            this.indexes.every((index) => {
                if (collection === index.getCollection()) { // matches collection
                    const match = index.partiallyMatchesFilter(search);
                    if (match) {
                        logger(`Looking for index for collection ${collection} for search criteria, found partial match index ${index.getName()}`);
                        result = index;
                        return false;
                    }
                }
                return true;
            });
        }
        return result;
    }

    loadConfig(config: DBConfig): void {
        logger(`Loading index configurations`);
        this.config = config;
        const rebuildIndexes = ((process.env.REBUILD_INDEXES_ON_STARTUP || 'N') === 'Y');
        logger(`Will rebuild indexes? ${rebuildIndexes}`);
        if (this.config) {
            const dbLocation = this.config.dbLocation;
            // check on each index file
            this.config.indexes.forEach((indexConfig) => {
                const index = new IndexImplementation(dbLocation,indexConfig,this.managers);
                if (rebuildIndexes) index.rebuild();
                this.managers.getCollectionManager().getCollection(indexConfig.collection).addListener(index);
                this.indexes.push(index);
            });
        }
    }


}
