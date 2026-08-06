
export class JobRoleResponse {
    public readonly jobRoleId: number;
    public readonly roleName: string;
    public readonly location: string;
    public readonly closingDate: Date;
    public readonly status: string;

    constructor(jobRoleId: number, roleName: string, location: string, closingDate: Date, status: string) {
        this.jobRoleId = jobRoleId;
        this.roleName = roleName;
        this.location = location;
        this.closingDate = closingDate;
        this.status = status;
    }
}