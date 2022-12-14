import {Index} from "./Index";
import {IndexConfig, IndexContent, IndexEntry, IndexVersion} from "../config/Types";
import debug from 'debug';
import {SearchItem} from "../search/SearchTypes";
import {SearchProcessor} from "../search/SearchProcessor";
import {Cursor} from "../cursor/Cursor";
import {CursorImpl} from "../cursor/CursorImpl";
import {Collection} from "../collection/Collection";
import {Life} from "../life/Life";
import {Util} from "../util/Util";
import {DatabaseManagers} from "../DatabaseManagers";
import {SortOrderItem} from "../sort/SortTypes";
import {SortProcessor} from "../sort/SortProcessor";


const logger = debug('index-implementation');
const dLogger = debug('index-implementation-detail');

export class IndexImplementation implements Index, Life {
    private config: IndexConfig;
    private dbLocation: string;
    private version: IndexVersion;
    private content: IndexContent;
    private indexLoaded: boolean = false;
    private indexInUse: boolean = false;
    private defaultLifespan: number;
    private managers: DatabaseManagers;


    constructor(dbLocation: string, config: IndexConfig, managers: DatabaseManagers) {
        this.dbLocation = dbLocation;
        this.config = config;
        this.managers = managers;
        this.version = {
            version: 1,
            name: this.config.name,
            collection: this.config.collection
        };
        this.content = {
            version: 1,
            entries: []
        };

        this.defaultLifespan = parseInt(process.env.DEFAULT_INDEX_LIFESPAN_SEC || '600');
        if (isNaN(this.defaultLifespan)) {
            this.defaultLifespan = 600;
        }

        this.checkIndexUse = this.checkIndexUse.bind(this);
        this.getIndexContent = this.getIndexContent.bind(this);
        this.getIndexVersion = this.getIndexVersion.bind(this);
        this.managers.getLifecycleManager().addLife(this);
        logger(`Constructing index ${this.config.name} for collection ${this.config.collection}`);

    }

    findMatchingKeys(searchFilter: SearchItem[]): string[] {
        this.checkIndexLoaded();
        return [];
    }

    getCollection(): string {
        return this.config.collection + '';
    }

    getEntries(): IndexEntry[] {
        this.checkIndexLoaded();
        return this.content.entries;
    }

    getFields(): string[] {
        return Util.copyObject(this.config.fields);
    }

    getIndexContent(): IndexContent {
        this.checkIndexLoaded();
        return this.content;
    }

    getIndexVersion(): IndexVersion {
        this.checkIndexLoaded();
        return this.version;
    }

    getName(): string {
        return this.config.name + '';
    }

    getVersion(): number {
        this.checkIndexLoaded();
        return this.version.version;
    }

    matchesFilter(searchFilter: SearchItem[]): boolean {
        let result = true;
        searchFilter.forEach((searchItem) => {
            const foundIndex = this.config.fields.findIndex((field) => field === searchItem.field);
            if (foundIndex < 0) result = false;
        });
        return result;
    }

    partiallyMatchesFilter(searchFilter: SearchItem[]): boolean {
        let result = false;
        searchFilter.forEach((searchItem) => {
            const foundIndex = this.config.fields.findIndex((field) => field === searchItem.field);
            if (foundIndex >= 0) result = true;
        });
        return result;
    }

    objectAdded(collection: Collection, key: string, object: any): void {
        this.checkIndexLoaded();
        const config = collection.getConfig();
        logger(`Creating new index entry for ${key}`);
        const newEntry = this.constructIndexEntry(key, object);
        this.content.entries.push(newEntry);
        this.version.version = config.version;
        this.content.version = config.version;
        this.managers.getIndexFileManager().writeIndexFile(this);
    }

    objectRemoved(collection: Collection, key: string): void {
        this.checkIndexLoaded();
        const config = collection.getConfig();
        const foundIndex = this.content.entries.findIndex((entry) => entry.keyValue === key);
        if (foundIndex >= 0) {
            logger(`Removing index entry for ${key}`);
            this.content.entries.splice(foundIndex, 1);
        }
        this.version.version = config.version;
        this.content.version = config.version;
        this.managers.getIndexFileManager().writeIndexFile(this);
    }

    objectUpdated(collection: Collection, key: string, object: any): void {
        this.checkIndexLoaded();
        const config = collection.getConfig();
        const foundIndex = this.content.entries.findIndex((entry) => entry.keyValue === key);
        if (foundIndex >= 0) {
            logger(`Updating index entry for ${key}`);
            const newEntry = this.constructIndexEntry(key, object);
            this.content.entries.splice(foundIndex, 1, newEntry);

        } else {
            logger(`Adding index entry for ${key}`);
            const newEntry = this.constructIndexEntry(key, object);
            this.content.entries.push(newEntry);
        }
        this.version.version = config.version;
        this.content.version = config.version;
        this.managers.getIndexFileManager().writeIndexFile(this);

    }

    setVersion(version: number): void {
        this.checkIndexLoaded();
        this.version.version = version;
        this.content.version = version;
    }

    search(search: SearchItem[],sort:SortOrderItem[]): Cursor {
        let results: any[] = [];


        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} with search criteria`);
        logger(search);
        // what fields are we searching with?
        const indexSearchItems: SearchItem[] = [];
        search.forEach((searchItem) => {
            const foundIndex = this.config.fields.findIndex((field) => field === searchItem.field);
            if (foundIndex >= 0) {
                indexSearchItems.push(searchItem);
            }
        });
        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} - can only use criteria`);
        logger(indexSearchItems);
        // for each entry in the index, check if the fields match
        this.checkIndexLoaded();


        this.checkVersionSync();
        const matchingEntries: IndexEntry[] = [];
        this.content.entries.forEach((entry) => {
            dLogger(`Searching using index ${this.config.name} for collection ${this.config.collection} - checking entry`);
            dLogger(entry);
            if (this.indexEntryMatchesSearchItems(entry, indexSearchItems)) {
                matchingEntries.push(entry);
            }
        });
        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} - found ${matchingEntries.length} matching index entries`);
        // for all found matches, load the items from the collection
        const entriesUsingIndex:any[] = [];
        if (matchingEntries.length > 0) {
            const collection = this.managers.getCollectionManager().getCollection(this.config.collection);
            matchingEntries.forEach((matchingEntry) => {
                const item = collection.findByKey(matchingEntry.keyValue);
                if (item) {
                    entriesUsingIndex.push(item);
                }
            })
        }
        logger(`Searching using index ${this.config.name} for collection ${this.config.collection} - loaded ${entriesUsingIndex.length} matching items`);

        if (search.length > indexSearchItems.length) {
            logger('Refining index search results by the full search criteria');
            entriesUsingIndex.forEach((entry) => {
                if (SearchProcessor.doesItemMatchSearchItems(entry,search)) {
                    results.push(entry);
                }
            })
            logger(`Searching using index ${this.config.name} for collection ${this.config.collection} - refined to ${results.length} matching items`);
        }
        else {
            results = entriesUsingIndex;
        }




        if (sort) {
            return SortProcessor.sortItems(results,sort);
        }
        else {
            return new CursorImpl(results);
        }
    }

    rebuild(): void {
        this.rebuildIndex();
    }

    die(): void {
    }

    getBPM(): number {
        return Math.round(60 / (this.defaultLifespan / 2));
    }

    heartbeat(): void {
        this.checkIndexUse();
    }

    isAlive(): boolean {
        return true;
    }

    birth() {
    }

    protected checkIndexUse(): void {
        if (this.indexInUse) {
            this.indexInUse = false;
        } else {
            if (this.indexLoaded) this.removeIndexBuffer();
        }
    }

    protected removeIndexBuffer(): void {
        logger(`Index hasn't been used in ${this.defaultLifespan} seconds, removing buffer`);
        this.content.entries = [];
        this.indexLoaded = false;
        this.indexInUse = false;
    }

    protected checkIndexLoaded(): void {
        if (!this.indexLoaded) {
            const result = this.managers.getIndexFileManager().readIndex(this.config.collection, this.config.name);
            this.version = result.version;
            this.content = result.content;
            this.indexLoaded = true;
        }
        this.indexInUse = true;
    }

    protected rebuildIndex(): void {
        if (this.config) {
            const collection = this.managers.getCollectionManager().getCollection(this.config.collection);
            const versionNumber = collection.getVersion();
            const indexContent: IndexContent = {
                version: versionNumber,
                entries: []
            }
            const entries = collection.find().toArray();
            const keyField = collection.getKeyFieldName();
            entries.forEach((entry) => {
                const keyValue = entry[keyField];
                if (keyValue) {
                    const indexEntry = this.constructIndexEntry(keyValue, entry);
                    indexContent.entries.push(indexEntry);
                }
            });
            this.version.version = versionNumber;
            this.content = indexContent;
            this.indexLoaded = true;
            this.indexInUse = true;
            this.managers.getIndexFileManager().writeIndexFile(this);
        }
    }

    protected checkVersionSync(): void {
        const collectionVersion = this.managers.getCollectionManager().getCollection(this.config.collection).getVersion();
        // check versions
        if ((this.version.version !== collectionVersion) || (this.content.version !== collectionVersion)) {
            logger(`Index ${this.config.name} has version ${this.version.version} which does not match collection ${this.config.collection} version ${collectionVersion} - rebuilding`);
            this.version.version = collectionVersion;
            this.rebuildIndex();
        }
    }

    private constructIndexEntry(key: string, object: any): IndexEntry {
        const indexEntry: IndexEntry = {
            keyValue: key,
            fieldValues: []
        }
        // find each field for index config
        this.config.fields.forEach((field => {
            const fieldValue = Util.getFieldValue(object, field);
            if (fieldValue) {
                indexEntry.fieldValues.push({
                    field: field,
                    value: fieldValue
                });
            }
        }));
        return indexEntry;
    }

    private indexEntryFieldMatchesSearchItem(entry: IndexEntry, searchItem: SearchItem): boolean {
        let result = false;
        const foundIndex = entry.fieldValues.findIndex((fieldValue) => fieldValue.field === searchItem.field);
        if (foundIndex >= 0) {
            const entryValue = entry.fieldValues[foundIndex].value;
            result = SearchProcessor.doesValueMatchSearchItem(entryValue, searchItem);
            dLogger(`Comparing entry value ${entryValue} with ${searchItem.value} and comparison "${searchItem.comparison}" with result ${result}`);

        }
        return result;
    }

    private indexEntryMatchesSearchItems(entry: IndexEntry, searchItems: SearchItem[]): boolean {
        let result = true;
        // every value must match
        searchItems.every((searchItem) => {
            if (this.indexEntryFieldMatchesSearchItem(entry, searchItem)) {
                return true;
            } else {
                result = false;
                return false;
            }

        });
        return result;
    }

    removeAll(collection: Collection): void {
        this.rebuild();
    }


}
