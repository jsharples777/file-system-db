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


    private heartbeats:Life[] = [];
    private configs:HeartbeatConfig[] = [];
    private numberOfBeats:number = 0;
    private beatSpacing:number = 500;
    // @ts-ignore
    private interval: NodeJS.Timer;
    private isDying: boolean;

    public constructor(){
        this.aging = this.aging.bind(this);
        this.isDying = false;
    }

    protected configNewLife(life:Life):void {
        const numberOfTicksPerMinute = 60000/this.beatSpacing;
        let nextBeatDueEveryLifeCycleManagerTick = Math.round(numberOfTicksPerMinute/life.getBPM());
        if (nextBeatDueEveryLifeCycleManagerTick < 1) nextBeatDueEveryLifeCycleManagerTick = 1;
        dLogger(`Heartbeat ${life.getName()} - beat every ${nextBeatDueEveryLifeCycleManagerTick} ticks`);
        const config:HeartbeatConfig = {
            life,
            nextBeat: nextBeatDueEveryLifeCycleManagerTick
        }
        this.configs.push(config);

    }

    public addLife(life:Life):void {
        logger(`Adding heartbeat ${life.getName()}`);
        this.heartbeats.push(life);
        // if already birthed, start this new life
        if (this.numberOfBeats > 0) {
            this.configNewLife(life);
            life.birth();
            life.heartbeat();
        }
    }

    public birth():void {
        // go through the heartbeats find give an initial beat
        this.numberOfBeats = 0;
        const numberOfTicksPerMinute = 60000/this.beatSpacing;
        logger(`Birth - number of ticks per minute ${numberOfTicksPerMinute}`);
        this.heartbeats.forEach((life) => {
            this.configNewLife(life);
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
        if (!this.isDying) {
            this.isDying = true;
            logger('Death');
            if (this.interval) clearInterval(this.interval);
            this.numberOfBeats = 0;
            this.heartbeats.forEach((heartbeat) => {
                logger(`Waiting for ${heartbeat.getName()} to die`);
                heartbeat.die();
                logger(`${heartbeat.getName()} dead`);
            })
        }
    }


}
