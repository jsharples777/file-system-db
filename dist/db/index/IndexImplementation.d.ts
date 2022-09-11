import { Index } from "./Index";
import { IndexConfig, IndexContent, IndexEntry, IndexVersion } from "../Types";
import { SearchItem } from "../search/SearchTypes";
import { Cursor } from "../cursor/Cursor";
export declare class IndexImplementation implements Index {
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
    objectAdded(version: number, key: string, object: any): void;
    objectRemoved(version: number, key: string): void;
    private constructIndexEntry;
    objectUpdated(version: number, key: string, object: any): void;
    setVersion(version: number): void;
    protected rebuildIndex(): void;
    private indexEntryFieldMatchesSearchItem;
    private indexEntryMatchesSearchItems;
    search(search: SearchItem[]): Cursor;
}
