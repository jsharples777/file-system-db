"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifeCycleManager = void 0;
const debug_1 = __importDefault(require("debug"));
const timers_1 = require("timers");
const logger = (0, debug_1.default)('life-cycle-manager');
const dLogger = (0, debug_1.default)('life-cycle-manager-detail');
const hbLogger = (0, debug_1.default)('life-cycle-manager-hb');
class LifeCycleManager {
    constructor() {
        this.heartbeats = [];
        this.configs = [];
        this.numberOfBeats = 0;
        this.beatSpacing = 500;
        this.aging = this.aging.bind(this);
    }
    configNewLife(life) {
        const numberOfTicksPerMinute = 60000 / this.beatSpacing;
        let nextBeatDueEveryLifeCycleManagerTick = Math.round(numberOfTicksPerMinute / life.getBPM());
        if (nextBeatDueEveryLifeCycleManagerTick < 1)
            nextBeatDueEveryLifeCycleManagerTick = 1;
        dLogger(`Heartbeat ${life.getName()} - beat every ${nextBeatDueEveryLifeCycleManagerTick} ticks`);
        const config = {
            life,
            nextBeat: nextBeatDueEveryLifeCycleManagerTick
        };
        this.configs.push(config);
    }
    addLife(life) {
        logger(`Adding heartbeat ${life.getName()}`);
        this.heartbeats.push(life);
        // if already birthed, start this new life
        if (this.numberOfBeats > 0) {
            this.configNewLife(life);
            life.birth();
            life.heartbeat();
        }
    }
    birth() {
        // go through the heartbeats find give an initial beat
        this.numberOfBeats = 0;
        const numberOfTicksPerMinute = 60000 / this.beatSpacing;
        logger(`Birth - number of ticks per minute ${numberOfTicksPerMinute}`);
        this.heartbeats.forEach((life) => {
            this.configNewLife(life);
            life.birth();
            life.heartbeat();
        });
        this.numberOfBeats++;
        this.interval = setInterval(() => {
            this.aging();
        }, this.beatSpacing);
    }
    aging() {
        this.numberOfBeats++;
        dLogger(`Aging, number of heart beats ${this.numberOfBeats}`);
        this.configs.forEach((config) => {
            if (config.life.isAlive()) {
                dLogger(`Checking ${config.life.getName()} who should beat every ${config.nextBeat} beats`);
                if (this.numberOfBeats % config.nextBeat === 0) {
                    hbLogger(`Checking ${config.life.getName()} who should beat every ${config.nextBeat} beats - beating now`);
                    config.life.heartbeat();
                }
            }
        });
    }
    death() {
        logger('Death');
        if (this.interval)
            (0, timers_1.clearInterval)(this.interval);
        this.numberOfBeats = 0;
        this.heartbeats.forEach((heartbeat) => {
            logger(`Waiting for ${heartbeat.getName()} to die`);
            heartbeat.die();
            logger(`${heartbeat.getName()} dead`);
        });
    }
}
exports.LifeCycleManager = LifeCycleManager;
//# sourceMappingURL=LifeCycleManager.js.map