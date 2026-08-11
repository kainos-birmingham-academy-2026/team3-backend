
export class JobRole {
    public readonly jobRoleId: number;
    public readonly roleName: string;
    public readonly locationId: number;
    public readonly locationName: string;
    public readonly capabilityId: number;
    public readonly capabilityName: string;
    public readonly bandId: number;
    public readonly bandName: string;
    public readonly closingDate: Date | null;
    public readonly status: string;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(jobRoleId: number, roleName: string, locationId: number, locationName: string, capabilityId: number, capabilityName: string, bandId: number, bandName: string, closingDate: Date | null, status: string, createdAt: Date, updatedAt: Date) {
        this.jobRoleId = jobRoleId;
        this.roleName = roleName;
        this.locationId = locationId;
        this.locationName = locationName;
        this.capabilityId = capabilityId;
        this.capabilityName = capabilityName;
        this.bandId = bandId;
        this.bandName = bandName;
        this.closingDate = closingDate;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}