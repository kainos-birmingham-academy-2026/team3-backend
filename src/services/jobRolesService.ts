import type { JobRoleResponse } from "../models/jobRoleResponse.ts";
import { JobRoleDao } from "../models/jobRoleDao.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";

export class JobRolesService {
    private jobRoleDao: JobRoleDao;
    private jobRoleMapper: JobRoleMapper;

    constructor() {
        this.jobRoleDao = new JobRoleDao();
        this.jobRoleMapper = new JobRoleMapper();
    }

    async findAll(): Promise<JobRoleResponse[]> {
        const jobRoles = await this.jobRoleDao.findAll();
        return jobRoles.map(jobRole => this.jobRoleMapper.toResponse(jobRole));
    }

}