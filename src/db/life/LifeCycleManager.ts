import debug from 'debug';
import {Life} from "./Life";
import {clearInterval} from "timers";


const logger = debug('life-cycle-manager');
const dLogger = debug('life-cycle-manager-detail');
const hbLogger = debug('life-cycle-manager-hb');
type HeartbeatConfig = {
    life:Life,
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

    private heartbeats:Life[] = [];
    private configs:HeartbeatConfig[] = [];
    private numberOfBeats:number = 0;
    private beatSpacing:number = 500;
    // @ts-ignore
    private interval: NodeJS.Timer;

    private constructor(){
        this.aging = this.aging.bind(this);
    }

    public addLife(life:Life):void {
        logger(`Adding heartbeat ${life.getName()}`);
        this.heartbeats.push(life);
    }

    public birth():void {
        // go through the heartbeats find give an initial beat
        this.numberOfBeats = 0;
        const numberOfTicksPerMinute = 60000/this.beatSpacing;
        logger(`Birth - number of ticks per minute ${numberOfTicksPerMinute}`);
        this.heartbeats.forEach((life) => {
            let nextBeatDueEveryLifeCycleManagerTick = Math.round(numberOfTicksPerMinute/life.getBPM());
            if (nextBeatDueEveryLifeCycleManagerTick < 1) nextBeatDueEveryLifeCycleManagerTick = 1;
            dLogger(`Heartbeat ${life.getName()} - beat every ${nextBeatDueEveryLifeCycleManagerTick} ticks`);
            const config:HeartbeatConfig = {
                life,
                nextBeat: nextBeatDueEveryLifeCycleManagerTick
            }
            this.configs.push(config);
            life.birth();
            life.heartbeat();
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
            if (config.life.isAlive()) {
                dLogger(`Checking ${config.life.getName()} who should beat every ${config.nextBeat} beats`);
                if (this.numberOfBeats % config.nextBeat === 0) {
                    hbLogger(`Checking ${config.life.getName()} who should beat every ${config.nextBeat} beats - beating now`)
                    config.life.heartbeat();
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
