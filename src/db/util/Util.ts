export class Util {
    public static copyObject(object: any): any {
        let result = undefined;
        if (object) {
            result = JSON.parse(JSON.stringify(object));
        }
        return result;
    }

    public static getFieldValue(entry: any, field: string): any | undefined {
        let result: any | undefined = undefined;
        // any dot notation?
        const fieldParts = field.split('.');
        if (fieldParts.length > 1) {
            let previousValue = entry;
            fieldParts.forEach((fieldPart, index) => {
                if (previousValue) {
                    previousValue = previousValue[fieldPart];
                    if (index === (fieldParts.length - 1)) {
                        if (previousValue) {
                            result = previousValue;
                        }
                    }
                }
            });

        } else {
            result = entry[field];
        }
        return result;
    }

    public static setFieldValue(item: any, field: string, value: any): void {
        if (value) {
            const fieldParts = field.split('.');
            if (fieldParts.length > 1) {
                let previousValue = item;
                fieldParts.forEach((fieldPart, index) => {
                    if (index === (fieldParts.length - 1)) {
                        previousValue[fieldPart] = value;
                    } else {
                        if (!previousValue[fieldPart]) {
                            previousValue[fieldPart] = {};
                        }
                        previousValue = previousValue[fieldPart];
                    }
                });

            } else {
                item[field] = value;
            }
        }
    }
}
