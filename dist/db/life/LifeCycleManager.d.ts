import { Life } from "./Life";
export declare class LifeCycleManager {
    private heartbeats;
    private configs;
    private numberOfBeats;
    private beatSpacing;
    private interval;
    constructor();
    protected configNewLife(life: Life): void;
    addLife(life: Life): void;
    birth(): void;
    protected aging(): void;
    death(): void;
}
