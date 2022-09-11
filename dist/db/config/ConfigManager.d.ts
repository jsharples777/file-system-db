import { DBConfig } from "./Types";
export declare class ConfigManager {
    private static _instance;
    static getInstance(): ConfigManager;
    private constructor();
    loadConfig(configLocation: string): DBConfig;
}
