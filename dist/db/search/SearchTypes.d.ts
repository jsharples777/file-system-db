export declare enum SearchItemComparison {
    notEquals = -1,
    equals = 1,
    lessThan = 2,
    lessThanEqual = 3,
    greaterThan = 4,
    greaterThanEqual = 5,
    isNull = 6,
    isNotNull = 7
}
export declare type SearchItem = {
    field: string;
    comparison: SearchItemComparison;
    value?: any;
};
export declare type SearchFilter = {
    items: SearchItem[];
};
