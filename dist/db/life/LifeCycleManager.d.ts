import { Life } from "./Life";
export declare class LifeCycleManager {
    private heartbeats;
    private configs;
    private numberOfBeats;
    private beatSpacing;
    private interval;
    private isDying;
    private isSuspended;
    constructor();
    addLife(life: Life): void;
    birth(): void;
    death(): void;
    suspend(): void;
    resume(): void;
    protected configNewLife(life: Life): void;
    protected aging(): void;
}
