export class JobRoleApplication {
    public readonly applicationId: number;
    public readonly jobRoleId: number;
    public readonly userId: number;
    public readonly cvText: string;

    constructor(
        applicationId: number,
        jobRoleId: number,
        userId: number,
        cvText: string
    ) {
        this.applicationId = applicationId;
        this.jobRoleId = jobRoleId;
        this.userId = userId;
        this.cvText = cvText;
    }
}