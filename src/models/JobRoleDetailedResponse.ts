
export class JobRoleDetailedResponse {
    public readonly jobRoleId: number;
    public readonly roleName: string;
    public readonly description: string;
    public readonly responsibilities: string;
    public readonly sharepointUrl: string;
    public readonly numberOfOpenPositions: number;
    public readonly closingDate: Date | null;
    public readonly statusName: string;
    public readonly capabilityName: string;
    public readonly bandName: string;
    public readonly locationName: string;
    public readonly addressLine1: string;
    public readonly addressLine2: string | null;
    public readonly postcode: string;

    constructor(
        jobRoleId: number,
        roleName: string,
        description: string,
        responsibilities: string,
        sharepointUrl: string,
        numberOfOpenPositions: number,
        closingDate: Date | null,
        statusName: string,
        capabilityName: string,
        bandName: string,
        locationName: string,
        addressLine1: string,
        addressLine2: string | null,
        postcode: string
    ) {
        this.jobRoleId = jobRoleId;
        this.roleName = roleName;
        this.description = description;
        this.responsibilities = responsibilities;
        this.sharepointUrl = sharepointUrl;
        this.numberOfOpenPositions = numberOfOpenPositions;
        this.closingDate = closingDate;
        this.statusName = statusName;
        this.capabilityName = capabilityName;
        this.bandName = bandName;
        this.locationName = locationName;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.postcode = postcode;
    }
}