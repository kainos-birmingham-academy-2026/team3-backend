import type { JobRoleResponse } from "../models/jobRoleResponse.ts";
import type { JobRole } from "../models/jobRole.js";

export class JobRoleMapper {
    toResponse(jobRole: JobRole): JobRoleResponse {
        return {
            jobRoleId: jobRole.jobRoleId,
            roleName: jobRole.roleName,
            location: jobRole.location,
            capabilityId: jobRole.capabilityId,
            bandId: jobRole.bandId,
            closingDate: jobRole.closingDate,
            status: jobRole.status
        };
    }
}