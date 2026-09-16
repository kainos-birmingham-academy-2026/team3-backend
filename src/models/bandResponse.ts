export class BandResponse {
	public readonly bandId: number;
	public readonly bandName: string;
	public readonly bandLevel: number;

	constructor(bandId: number, bandName: string, bandLevel: number) {
		this.bandId = bandId;
		this.bandName = bandName;
		this.bandLevel = bandLevel;
	}
}
