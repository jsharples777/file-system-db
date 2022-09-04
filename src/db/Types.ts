export type OperationResult = {
    completed: boolean,
    numberOfObjects: number,
    _id: string
}
/*
{
  "dbLocation": "./db",
  "collections": [
    {
      "name": "test",
      "key": "_id"
    }
  ],
  "indexes": [
    {
      "name": "test_idx01",
      "collection": "test",
      "fields": ["_id","dates.createdDate"]
    }
  ]

}

 */
export type CollectionNameKey = {
    name: string,
    key: string
}

export type IndexConfig = {
    name: string,
    collection: string,
    fields: string[]
}

export type DBConfig = {
    dbLocation: string,
    collections: CollectionNameKey[],
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

export type CollectionVersion = {
    name:string,
    version:number
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
