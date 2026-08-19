export class CapabilityResponse {
	public readonly capabilityId: number;
	public readonly capabilityName: string;

	constructor(capabilityId: number, capabilityName: string) {
		this.capabilityId = capabilityId;
		this.capabilityName = capabilityName;
	}
}
