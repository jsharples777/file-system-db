export type OperationResult = {
    completed: boolean,
    numberOfObjects: number,
    _id: string
}

export enum BufferType {
    NONE = 1,
    ALL,
    PARTIAL
}

export enum EntryFileType {
    ALL_IN_SINGLE_FILE=1,
    FILE_PER_ENTRY
}

export type CollectionConfig = {
    name: string,
    key: string,
    entryFileType:EntryFileType,
    bufferType:BufferType,
    bufferSize?:number,
    version:number
}

export type IndexConfig = {
    name: string,
    collection: string,
    fields: string[]
}

export type DBConfig = {
    dbLocation: string,
    collections: CollectionConfig[],
    indexes: IndexConfig[]
}

export type IndexEntryFieldNameValue = {
    field:string,
    value:any
}

export type IndexEntry = {
    keyValue:string,
    fieldValues:IndexEntryFieldNameValue[]
}

export type Index = {
    version:number,
    entries: IndexEntry[]
}

export type IndexVersion = {
    name: string,
    collection: string,
    version:number,
}


export class MissingConfiguration extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidConfiguration extends Error {
    constructor(message: string) {
        super(message);
    }
}
