import type { JobRoleResponse } from "../models/jobRoleResponse.ts";
import { JobRoleDao } from "../models/jobRoleDao.js";
import type { JobRoleApplication } from "../models/jobRoleApplication.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { JobRoleDetailedResponse } from "../models/JobRoleDetailedResponse.js";
import { NotFoundError } from "error-lib";

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

    async createApplication(jobRoleId: number, applicationData: any): Promise<JobRoleApplication> {
        const jobRole = await this.jobRoleDao.findById(jobRoleId);
        if (!jobRole) {
            throw new NotFoundError(`JobRole with id ${jobRoleId} not found`);
        }
        //wait for auth merge id on applicationdatat userId
        const existingApplication = await this.jobRoleDao.findApplicationByUserIdAndJobRoleId(applicationData.userId, jobRoleId);
        if (existingApplication) {
            throw new Error(`User with id ${applicationData.userId} has already applied for JobRole with id ${jobRoleId}`);
        }
        return await this.jobRoleDao.createApplication(jobRoleId, applicationData);
    }

}