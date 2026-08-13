export class StatusResponse {
    public readonly statusId: number;
    public readonly statusName: string;

    constructor(statusId: number, statusName: string) {
        this.statusId = statusId;
        this.statusName = statusName;
    }
}