export class LocationResponse {
    public readonly locationId: number;
    public readonly locationName: string;

    constructor(locationId: number, locationName: string) {
        this.locationId = locationId;
        this.locationName = locationName;
    }
}