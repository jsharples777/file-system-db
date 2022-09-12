import { DBConfig } from "./Types";
export declare class ConfigManager {
    constructor();
    loadConfig(configLocation: string): DBConfig;
}
