export class BandResponse {
    public readonly bandId: number;
    public readonly bandName: string;

    constructor(bandId: number, bandName: string) {
        this.bandId = bandId;
        this.bandName = bandName;
    }
}