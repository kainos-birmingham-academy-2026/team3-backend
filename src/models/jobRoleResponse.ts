
export class JobRoleResponse {
    public readonly jobRoleId: number;
    public readonly roleName: string;
    public readonly locationName: string;
    public readonly capabilityName: string;
    public readonly bandName: string;
    public readonly closingDate: Date | null;
    public readonly status: string;

    constructor(jobRoleId: number, roleName: string, locationName: string, capabilityName: string, bandName: string, closingDate: Date | null, status: string) {
        this.jobRoleId = jobRoleId;
        this.roleName = roleName;
        this.locationName = locationName;
        this.capabilityName = capabilityName;
        this.bandName = bandName;
        this.closingDate = closingDate;
        this.status = status;
    }
}