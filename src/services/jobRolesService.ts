import { NotFoundError } from "error-lib";
import type {
	CreateApplicationRequestDto,
	CreateJobRoleRequestDto,
	JobRoleFiltersDto,
	UpdateJobRoleRequestDto,
} from "../dtos/jobRoleDto.js";
import { ConflictError } from "../errors/conflictError.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import type { BandResponse } from "../models/bandResponse.js";
import type { CapabilityResponse } from "../models/capabilityResponse.js";
import type { JobRoleDetailedResponse } from "../models/jobRoleDetailedResponse.js";
import type { JobRoleApplication } from "../models/jobRoleApplication.js";
import { JobRoleDao } from "../models/jobRoleDao.js";
import type { JobRoleResponse } from "../models/jobRoleResponse.js";
import type { LocationResponse } from "../models/locationResponse.js";
import type { StatusResponse } from "../models/statusResponse.js";

export class JobRolesService {
	private jobRoleDao: JobRoleDao;
	private jobRoleMapper: JobRoleMapper;

	constructor() {
		this.jobRoleDao = new JobRoleDao();
		this.jobRoleMapper = new JobRoleMapper();
	}

	async findAll(filters: JobRoleFiltersDto = {}): Promise<JobRoleResponse[]> {
		const jobRoles = await this.jobRoleDao.findAll(filters);
		return jobRoles.map((jobRole) =>
			this.jobRoleMapper.jobRoleToResponse(jobRole),
		);
	}

	async findById(jobRoleId: number): Promise<JobRoleDetailedResponse> {
		const jobRole = await this.jobRoleDao.findById(jobRoleId);
		if (!jobRole) {
			throw new NotFoundError(`JobRole with id ${jobRoleId} not found`);
		}
		return this.jobRoleMapper.jobRoleToDetailedResponse(jobRole);
	}

	async createJobRole(data: CreateJobRoleRequestDto): Promise<JobRoleResponse> {
		const jobRole = await this.jobRoleDao.createJobRole(data);
		return this.jobRoleMapper.jobRoleToResponse(jobRole);
	}

	async updateJobRole(
		jobRoleId: number,
		data: UpdateJobRoleRequestDto,
	): Promise<JobRoleDetailedResponse> {
		const existingJobRole = await this.jobRoleDao.findById(jobRoleId);
		if (!existingJobRole) {
			throw new NotFoundError(`JobRole with id ${jobRoleId} not found`);
		}

		const jobRole = await this.jobRoleDao.updateJobRole(jobRoleId, data);
		return this.jobRoleMapper.jobRoleToDetailedResponse(jobRole);
	}

	async deleteJobRole(jobRoleId: number): Promise<void> {
		const existingJobRole = await this.jobRoleDao.findById(jobRoleId);
		if (!existingJobRole) {
			throw new NotFoundError(`JobRole with id ${jobRoleId} not found`);
		}

		await this.jobRoleDao.deleteJobRole(jobRoleId);
	}

	async createApplication(
		jobRoleId: number,
		userId: number,
		data: Pick<CreateApplicationRequestDto, "cvText">,
	): Promise<JobRoleApplication> {
		const jobRole = await this.jobRoleDao.findById(jobRoleId);
		if (!jobRole) {
			throw new NotFoundError(`JobRole with id ${jobRoleId} not found`);
		}
		const existingApplication =
			await this.jobRoleDao.findApplicationByUserIdAndJobRoleId(
				userId,
				jobRoleId,
			);
		if (existingApplication) {
			throw new ConflictError(
				409,
				`User with id ${userId} has already applied for JobRole with id ${jobRoleId}`,
			);
		}
		return await this.jobRoleDao.createApplication(jobRoleId, userId, data);
	}

	//get status, band, capability, location for job role creation form
	async getStatus(): Promise<StatusResponse[]> {
		const status = await this.jobRoleDao.getStatus();
		if (!status || status.length === 0) {
			throw new NotFoundError("No status found");
		}
		return this.jobRoleMapper.statusToResponse(status);
	}

	async getBands(): Promise<BandResponse[]> {
		const bands = await this.jobRoleDao.getBands();
		if (!bands || bands.length === 0) {
			throw new NotFoundError("No bands found");
		}
		return this.jobRoleMapper.bandToResponse(bands);
	}

	async getCapabilities(): Promise<CapabilityResponse[]> {
		const capabilities = await this.jobRoleDao.getCapabilities();
		if (!capabilities || capabilities.length === 0) {
			throw new NotFoundError("No capabilities found");
		}
		return this.jobRoleMapper.capabilityToResponse(capabilities);
	}

	async getLocations(): Promise<LocationResponse[]> {
		const locations = await this.jobRoleDao.getLocations();
		if (!locations || locations.length === 0) {
			throw new NotFoundError("No locations found");
		}
		return this.jobRoleMapper.locationToResponse(locations);
	}
}
