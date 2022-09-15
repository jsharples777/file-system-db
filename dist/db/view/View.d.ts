import { Cursor } from '../cursor/Cursor';
import { ViewListener } from "./ViewListener";
export interface View {
    getName(): string;
    content(): Cursor;
    addListener(listener: ViewListener): void;
}
