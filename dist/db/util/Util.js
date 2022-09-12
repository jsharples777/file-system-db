"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
class Util {
    static copyObject(object) {
        let result = undefined;
        if (object) {
            result = JSON.parse(JSON.stringify(object));
        }
        return result;
    }
    static getFieldValue(entry, field) {
        let result = undefined;
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
        }
        else {
            result = entry[field];
        }
        return result;
    }
    static setFieldValue(item, field, value) {
        if (value) {
            const fieldParts = field.split('.');
            if (fieldParts.length > 1) {
                let previousValue = item;
                fieldParts.forEach((fieldPart, index) => {
                    if (index === (fieldParts.length - 1)) {
                        previousValue[fieldPart] = value;
                    }
                    else {
                        if (!previousValue[fieldPart]) {
                            previousValue[fieldPart] = {};
                        }
                        previousValue = previousValue[fieldPart];
                    }
                });
            }
            else {
                item[field] = value;
            }
        }
    }
}
exports.Util = Util;
//# sourceMappingURL=Util.js.map