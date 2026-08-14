import type { JobRoleResponse } from "../models/jobRoleResponse.js";
import type { JobRole } from "../models/jobRole.js";
import { JobRoleDetailedResponse } from "../models/jobRoleDetailedResponse.js";
import { StatusResponse } from "../models/statusResponse.js";
import { BandResponse } from "../models/bandResponse.js";
import { CapabilityResponse } from "../models/capabilityResponse.js";
import { LocationResponse } from "../models/locationResponse.js";

export class JobRoleMapper {

    jobRoleToResponse(jobRole: JobRole): JobRoleResponse {
        return {
            jobRoleId: jobRole.jobRoleId,
            roleName: jobRole.roleName,
            closingDate: jobRole.closingDate,
            capabilityName: jobRole.capabilityName,
            bandName: jobRole.bandName,
            locationName: jobRole.locationName,
            statusName: jobRole.statusName
        };
    }

    jobRoleToDetailedResponse(jobRole: JobRole): JobRoleDetailedResponse {
        return {
            jobRoleId: jobRole.jobRoleId,
            roleName: jobRole.roleName,
            description: jobRole.description,
            responsibilities: jobRole.responsibilities,
            sharepointUrl: jobRole.sharepointUrl,
            numberOfOpenPositions: jobRole.numberOfOpenPositions,
            closingDate: jobRole.closingDate,
            capabilityName: jobRole.capabilityName,
            bandName: jobRole.bandName,
            locationName: jobRole.locationName,
            statusName: jobRole.statusName,
            addressLine1: jobRole.addressLine1,
            addressLine2: jobRole.addressLine2,
            postcode: jobRole.postcode
        };
    }

    statusToResponse(rows: { statusId: number; statusName: string }[]): StatusResponse[] {
        return rows.map(row => new StatusResponse(row.statusId, row.statusName));
    }

    bandToResponse(rows: { bandId: number; bandName: string }[]): BandResponse[] {
        return rows.map(row => new BandResponse(row.bandId, row.bandName));
    }

    capabilityToResponse(rows: { capabilityId: number; capabilityName: string }[]): CapabilityResponse[] {
        return rows.map(row => new CapabilityResponse(row.capabilityId, row.capabilityName));
    }

    locationToResponse(rows: { locationId: number; locationName: string;}[]): LocationResponse[] {
        return rows.map(row => new LocationResponse(row.locationId, row.locationName));
    }

}