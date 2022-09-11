import debug from 'debug';
import {Heartbeat} from "./Heartbeat";
import {clearInterval} from "timers";


const logger = debug('life-cycle-manager');
const dLogger = debug('life-cycle-manager-detail');

type HeartbeatConfig = {
    heartbeat:Heartbeat,
    nextBeat:number
}

export class LifeCycleManager {
    private static _instance: LifeCycleManager;

    public static getInstance(): LifeCycleManager {
        if (!LifeCycleManager._instance) {
            LifeCycleManager._instance = new LifeCycleManager();
        }
        return LifeCycleManager._instance;
    }

    private heartbeats:Heartbeat[] = [];
    private configs:HeartbeatConfig[] = [];
    private numberOfBeats:number = 0;
    private beatSpacing:number = 500;
    // @ts-ignore
    private interval: NodeJS.Timer;

    private constructor(){
        this.aging = this.aging.bind(this);
    }

    public addLife(heartbeat:Heartbeat):void {
        logger(`Adding heartbeat ${heartbeat.getName()}`);
        this.heartbeats.push(heartbeat);
    }

    public birth():void {
        // go through the heartbeats find give an initial beat
        this.numberOfBeats = 0;
        const numberOfTicksPerMinute = 60000/this.beatSpacing;
        logger(`Birth - number of ticks per minute ${numberOfTicksPerMinute}`);
        this.heartbeats.forEach((heartbeat) => {
            let nextBeatDueEveryLifeCycleManagerTick = Math.round(numberOfTicksPerMinute/heartbeat.getBPM());
            if (nextBeatDueEveryLifeCycleManagerTick < 1) nextBeatDueEveryLifeCycleManagerTick = 1;
            dLogger(`Heartbeat ${heartbeat.getName()} - beat every ${nextBeatDueEveryLifeCycleManagerTick} ticks`);
            const config:HeartbeatConfig = {
                heartbeat,
                nextBeat: nextBeatDueEveryLifeCycleManagerTick
            }
            this.configs.push(config);
            heartbeat.heartbeat();
        });
        this.numberOfBeats ++;

        this.interval = setInterval(() => {
            this.aging();
        },this.beatSpacing);
    }

    protected aging():void {
        this.numberOfBeats++;
        dLogger(`Aging, number of heart beats ${this.numberOfBeats}`);
        this.configs.forEach((config) => {
            if (config.heartbeat.isAlive()) {
                dLogger(`Checking ${config.heartbeat.getName()} who should beat every ${config.nextBeat} beats`);
                if (this.numberOfBeats % config.nextBeat === 0) {
                    dLogger(`Checking ${config.heartbeat.getName()} who should beat every ${config.nextBeat} beats - beating now`)
                    config.heartbeat.heartbeat();
                }
            }
        })

    }

    public death():void {
        logger('Death');
        if (this.interval) clearInterval(this.interval);
        this.heartbeats.forEach((heartbeat) => {
            heartbeat.die();
        })
    }


}
