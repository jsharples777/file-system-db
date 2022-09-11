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
class LifeCycleManager {
    constructor() {
        this.heartbeats = [];
        this.configs = [];
        this.numberOfBeats = 0;
        this.beatSpacing = 500;
        this.aging = this.aging.bind(this);
    }
    static getInstance() {
        if (!LifeCycleManager._instance) {
            LifeCycleManager._instance = new LifeCycleManager();
        }
        return LifeCycleManager._instance;
    }
    addLife(heartbeat) {
        logger(`Adding heartbeat ${heartbeat.getName()}`);
        this.heartbeats.push(heartbeat);
    }
    birth() {
        // go through the heartbeats find give an initial beat
        this.numberOfBeats = 0;
        const numberOfTicksPerMinute = 60000 / this.beatSpacing;
        logger(`Birth - number of ticks per minute ${numberOfTicksPerMinute}`);
        this.heartbeats.forEach((heartbeat) => {
            let nextBeatDueEveryLifeCycleManagerTick = Math.round(numberOfTicksPerMinute / heartbeat.getBPM());
            if (nextBeatDueEveryLifeCycleManagerTick < 1)
                nextBeatDueEveryLifeCycleManagerTick = 1;
            dLogger(`Heartbeat ${heartbeat.getName()} - beat every ${nextBeatDueEveryLifeCycleManagerTick} ticks`);
            const config = {
                heartbeat,
                nextBeat: nextBeatDueEveryLifeCycleManagerTick
            };
            this.configs.push(config);
            heartbeat.heartbeat();
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
            if (config.heartbeat.isAlive()) {
                dLogger(`Checking ${config.heartbeat.getName()} who should beat every ${config.nextBeat} beats`);
                if (this.numberOfBeats % config.nextBeat === 0) {
                    dLogger(`Checking ${config.heartbeat.getName()} who should beat every ${config.nextBeat} beats - beating now`);
                    config.heartbeat.heartbeat();
                }
            }
        });
    }
    death() {
        logger('Death');
        if (this.interval)
            (0, timers_1.clearInterval)(this.interval);
        this.heartbeats.forEach((heartbeat) => {
            heartbeat.die();
        });
    }
}
exports.LifeCycleManager = LifeCycleManager;
//# sourceMappingURL=LifeCycleManager.js.map