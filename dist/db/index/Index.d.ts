import { IndexContent, IndexEntry, IndexVersion } from "../Types";
import { SearchItem } from "../search/SearchTypes";
import { Cursor } from "../cursor/Cursor";
export interface Index {
    setVersion(version: number): void;
    getVersion(): number;
    getName(): string;
    getCollection(): string;
    getFields(): string[];
    getEntries(): IndexEntry[];
    objectAdded(version: number, key: string, object: any): void;
    objectRemoved(version: number, key: string): void;
    objectUpdated(version: number, key: string, object: any): void;
    matchesFilter(searchFilter: SearchItem[]): boolean;
    partiallyMatchesFilter(searchFilter: SearchItem[]): boolean;
    findMatchingKeys(searchFilter: SearchItem[]): string[];
    getIndexVersion(): IndexVersion;
    getIndexContent(): IndexContent;
    search(search: SearchItem[]): Cursor;
    rebuild(): void;
}
