export declare type OperationResult = {
    completed: boolean;
    numberOfObjects: number;
    _id: string;
};
export declare enum BufferType {
    NONE = 1,
    ALL = 2,
    FIFO = 3,
    LIFESPAN = 4
}
export declare type CollectionConfig = {
    name: string;
    key: string;
    bufferType: BufferType;
    bufferSize?: number;
    bufferItemLifecycleSeconds?: number;
    highVolumeChanges?: number;
    version: number;
};
export declare type IndexConfig = {
    name: string;
    collection: string;
    fields: string[];
};
export declare type DBConfig = {
    dbLocation: string;
    collections: CollectionConfig[];
    indexes: IndexConfig[];
};
export declare type IndexEntryFieldNameValue = {
    field: string;
    value: any;
};
export declare type IndexEntry = {
    keyValue: string;
    fieldValues: IndexEntryFieldNameValue[];
};
export declare type IndexContent = {
    version: number;
    entries: IndexEntry[];
};
export declare type IndexVersion = {
    name: string;
    collection: string;
    version: number;
};
export declare class MissingConfiguration extends Error {
    constructor(message: string);
}
export declare class InvalidConfiguration extends Error {
    constructor(message: string);
}
export declare class DuplicateKey extends Error {
    constructor(message: string);
}
