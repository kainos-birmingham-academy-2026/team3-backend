import type { JobRoleResponse } from "../models/jobRoleResponse.ts";
import { JobRoleDao } from "../models/jobRoleDao.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { JobRoleDetailedResponse } from "../models/JobRoleDetailedResponse.js";
import { NotFoundError } from "../errors/notFoundError.js";

export class JobRolesService {
    private jobRoleDao: JobRoleDao;
    private jobRoleMapper: JobRoleMapper;

    constructor() {
        this.jobRoleDao = new JobRoleDao();
        this.jobRoleMapper = new JobRoleMapper();
    }

    async findAll(): Promise<JobRoleResponse[]> {
        const jobRoles = await this.jobRoleDao.findAll();
        return jobRoles.map(jobRole => this.jobRoleMapper.jobRoleToResponse(jobRole));
    }

    async findById(jobRoleId: number): Promise<JobRoleDetailedResponse> {
        const jobRole = await this.jobRoleDao.findById(jobRoleId);
        if (!jobRole) {
            throw new NotFoundError(`JobRole with id ${jobRoleId} not found`);
        }
        return this.jobRoleMapper.jobRoleToDetailedResponse(jobRole);
    }

}