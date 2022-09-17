import { IndexContent, IndexEntry, IndexVersion } from "../config/Types";
import { SearchItem } from "../search/SearchTypes";
import { Cursor } from "../cursor/Cursor";
import { CollectionListener } from "../collection/CollectionListener";
import { SortOrderItem } from "../sort/SortTypes";
export interface Index extends CollectionListener {
    setVersion(version: number): void;
    getVersion(): number;
    getName(): string;
    getCollection(): string;
    getFields(): string[];
    getEntries(): IndexEntry[];
    matchesFilter(searchFilter: SearchItem[]): boolean;
    partiallyMatchesFilter(searchFilter: SearchItem[]): boolean;
    findMatchingKeys(searchFilter: SearchItem[]): string[];
    getIndexVersion(): IndexVersion;
    getIndexContent(): IndexContent;
    search(search: SearchItem[], sort?: SortOrderItem[]): Cursor;
    rebuild(): void;
}
