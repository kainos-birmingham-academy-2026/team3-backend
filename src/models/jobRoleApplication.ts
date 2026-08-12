export class JobRoleApplication {
    public readonly applicationId: number;
    public readonly jobRoleId: number;
    public readonly userId: number;
    public readonly cvReference: string;

    constructor(
        applicationId: number,
        jobRoleId: number,
        userId: number,
        cvReference: string
    ) {
        this.applicationId = applicationId;
        this.jobRoleId = jobRoleId;
        this.userId = userId;
        this.cvReference = cvReference;
    }
}