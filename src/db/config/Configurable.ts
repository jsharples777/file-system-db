import {DBConfig} from "./Types";

export interface Configurable {
    loadConfig(config: DBConfig): void;
}
