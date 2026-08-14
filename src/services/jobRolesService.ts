import type { JobRoleResponse } from "../models/jobRoleResponse.ts";
import { JobRoleDao } from "../models/jobRoleDao.js";
import type { JobRoleApplication } from "../models/jobRoleApplication.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { JobRoleDetailedResponse } from "../models/jobRoleDetailedResponse.js";
import { NotFoundError } from "error-lib";
import { ConflictError } from "../errors/conflictError.js";
import { CreateApplicationRequestDto } from "../dtos/jobRoleDto.js";
import { StatusResponse } from "../models/statusResponse.js";
import { CapabilityResponse } from "../models/capabilityResponse.js";
import { BandResponse } from "../models/bandResponse.js";
import { LocationResponse } from "../models/locationResponse.js";

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

    async createJobRole(data: any): Promise<JobRoleResponse> {
        const jobRole = await this.jobRoleDao.createJobRole(data);
        return this.jobRoleMapper.jobRoleToResponse(jobRole);
    }

    async createApplication(jobRoleId: number, userId: number, data: CreateApplicationRequestDto): Promise<JobRoleApplication> {
        const jobRole = await this.jobRoleDao.findById(jobRoleId);
        if (!jobRole) {
            throw new NotFoundError(`JobRole with id ${jobRoleId} not found`);
        }
        const existingApplication = await this.jobRoleDao.findApplicationByUserIdAndJobRoleId(userId, jobRoleId);
        if (existingApplication) {
            throw new ConflictError(409, `User with id ${userId} has already applied for JobRole with id ${jobRoleId}`);
        }
        return await this.jobRoleDao.createApplication(jobRoleId, userId, data);
    }


    //get status, band, capability, location for job role creation form
    async getStatus(): Promise<StatusResponse[]> {
        const status = await this.jobRoleDao.getStatus();
        if (!status || status.length === 0) {
            throw new NotFoundError('No status found');
        }
        return this.jobRoleMapper.statusToResponse(status);
    }
    
    async getBands(): Promise<BandResponse[]> {
        const bands = await this.jobRoleDao.getBands();
        if (!bands || bands.length === 0) {
            throw new NotFoundError('No bands found');
        }
        return this.jobRoleMapper.bandToResponse(bands);
    }

    async getCapabilities(): Promise<CapabilityResponse[]> {
        const capabilities = await this.jobRoleDao.getCapabilities();
        if (!capabilities || capabilities.length === 0) {
            throw new NotFoundError('No capabilities found');
        }
        return this.jobRoleMapper.capabilityToResponse(capabilities);
    }

    async getLocations(): Promise<LocationResponse[]> {
        const locations = await this.jobRoleDao.getLocations();
        if (!locations || locations.length === 0) {
            throw new NotFoundError('No locations found');
        }
        return this.jobRoleMapper.locationToResponse(locations);
    } 

}