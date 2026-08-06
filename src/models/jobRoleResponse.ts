
export class JobRoleResponse {
    public readonly jobRoleId: number;
    public readonly roleName: string;
    public readonly location: string;
    public readonly capabilityId: number;
    public readonly bandId: number;
    public readonly closingDate: Date;
    public readonly status: string;

    constructor(jobRoleId: number, roleName: string, location: string, capabilityId: number, bandId: number, closingDate: Date, status: string) {
        this.jobRoleId = jobRoleId;
        this.roleName = roleName;
        this.location = location;
        this.capabilityId = capabilityId;
        this.bandId = bandId;
        this.closingDate = closingDate;
        this.status = status;
    }
}