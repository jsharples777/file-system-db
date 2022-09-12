import { Life } from "./Life";
export declare class LifeCycleManager {
    private static _instance;
    static getInstance(): LifeCycleManager;
    private heartbeats;
    private configs;
    private numberOfBeats;
    private beatSpacing;
    private interval;
    private constructor();
    protected configNewLife(life: Life): void;
    addLife(life: Life): void;
    birth(): void;
    protected aging(): void;
    death(): void;
}
