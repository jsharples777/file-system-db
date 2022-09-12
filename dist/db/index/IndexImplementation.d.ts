import { Index } from "./Index";
import { IndexConfig, IndexContent, IndexEntry, IndexVersion } from "../config/Types";
import { SearchItem } from "../search/SearchTypes";
import { Cursor } from "../cursor/Cursor";
import { Collection } from "../collection/Collection";
import { Life } from "../life/Life";
export declare class IndexImplementation implements Index, Life {
    private config;
    private dbLocation;
    private version;
    private content;
    private indexLoaded;
    private indexInUse;
    private defaultLifespan;
    constructor(dbLocation: string, config: IndexConfig);
    protected checkIndexUse(): void;
    protected removeIndexBuffer(): void;
    findMatchingKeys(searchFilter: SearchItem[]): string[];
    getCollection(): string;
    protected checkIndexLoaded(): void;
    getEntries(): IndexEntry[];
    getFields(): string[];
    getIndexContent(): IndexContent;
    getIndexVersion(): IndexVersion;
    getName(): string;
    getVersion(): number;
    matchesFilter(searchFilter: SearchItem[]): boolean;
    partiallyMatchesFilter(searchFilter: SearchItem[]): boolean;
    objectAdded(collection: Collection, key: string, object: any): void;
    objectRemoved(collection: Collection, key: string): void;
    private constructIndexEntry;
    objectUpdated(collection: Collection, key: string, object: any): void;
    setVersion(version: number): void;
    protected rebuildIndex(): void;
    private indexEntryFieldMatchesSearchItem;
    private indexEntryMatchesSearchItems;
    protected checkVersionSync(): void;
    search(search: SearchItem[]): Cursor;
    rebuild(): void;
    die(): void;
    getBPM(): number;
    heartbeat(): void;
    isAlive(): boolean;
    birth(): void;
}
