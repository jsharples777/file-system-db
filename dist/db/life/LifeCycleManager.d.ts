import { Heartbeat } from "./Heartbeat";
export declare class LifeCycleManager {
    private static _instance;
    static getInstance(): LifeCycleManager;
    private heartbeats;
    private configs;
    private numberOfBeats;
    private beatSpacing;
    private interval;
    private constructor();
    addLife(heartbeat: Heartbeat): void;
    birth(): void;
    protected aging(): void;
    death(): void;
}
