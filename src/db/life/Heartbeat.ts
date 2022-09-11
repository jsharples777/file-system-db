export interface Heartbeat {
    getName():string;
    isAlive():boolean;
    heartbeat():void;
    die():void;
    getBPM():number;
}
