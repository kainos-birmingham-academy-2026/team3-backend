export class JobRoleResponse {
	//in swager titled JobRoleSummary
	public readonly jobRoleId: number;
	public readonly roleName: string;
	public readonly closingDate: Date | null;
	public readonly capabilityName: string;
	public readonly bandName: string;
	public readonly locationName: string;
	public readonly statusName: string;
	public readonly openingDate?: Date | null;

	constructor(
		jobRoleId: number,
		roleName: string,
		closingDate: Date | null,
		capabilityName: string,
		bandName: string,
		locationName: string,
		statusName: string,
		openingDate?: Date | null,
	) {
		this.jobRoleId = jobRoleId;
		this.roleName = roleName;
		this.closingDate = closingDate;
		this.capabilityName = capabilityName;
		this.bandName = bandName;
		this.locationName = locationName;
		this.statusName = statusName;
		this.openingDate = openingDate;
	}
}
