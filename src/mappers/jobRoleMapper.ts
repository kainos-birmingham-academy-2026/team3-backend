import type { JobRoleResponse } from "../models/jobRoleResponse.ts";
import type { JobRole } from "../models/jobRole.js";
import { JobRoleDetailedResponse } from "../models/JobRoleDetailedResponse.js";

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

    
}