import { Cursor } from '../cursor/Cursor';
import { ObjectViewListener } from "./ObjectViewListener";
export interface ObjectView {
    getName(): string;
    content(): Cursor;
    addListener(listener: ObjectViewListener): void;
}
