import type { JobRoleResponse } from "../models/jobRoleResponse.ts";
import type { JobRole } from "../models/jobRole.js";

export class JobRoleMapper {
    toResponse(jobRole: JobRole): JobRoleResponse {
        return {
            jobRoleId: jobRole.jobRoleId,
            roleName: jobRole.roleName,
            locationName: jobRole.location,
            capabilityName: undefined as any,
            bandName: undefined as any,
            closingDate: jobRole.closingDate,
            status: jobRole.status
        };
    }
}