import type { JobRoleResponse } from "../models/jobRoleResponse.ts";
import type { JobRole } from "../models/jobRole.js";

export class JobRoleMapper {
    toResponse(jobRole: JobRole): JobRoleResponse {
        return {
            jobRoleId: jobRole.jobRoleId,
            roleName: jobRole.roleName,
            locationName: jobRole.locationName,
            capabilityName: jobRole.capabilityName,
            bandName: jobRole.bandName,
            closingDate: jobRole.closingDate,
            status: jobRole.status
        };
    }
}