interface IRecorder {
    readonly uin: number;
    readonly project: string;
    readonly url: string;
    readonly option: object;
}
declare class Recorder implements IRecorder {
    uin: number;
    project: string;
    url: string;
    option: object;
    private events;
    private startTime;
    private endTime;
    private session;
    constructor(uin: number | undefined, project: string | undefined, url: string | undefined, option: object);
    init(): void;
    record(): void;
    stop(): void;
    restore(binaryString: string): object;
    replay(): void;
    export(url: string): void;
    private setSession;
    private minimize;
}
export default Recorder;
