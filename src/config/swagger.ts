import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.3",
		info: {
			title: "Team3 Backend API",
			version: "1.0.0",
			description: "API docs for Team3 backend",
		},
		servers: [{ url: "http://localhost:4000" }],
		tags: [
			{ name: "Auth", description: "Authentication endpoints" },
			{ name: "Job Roles", description: "Job role endpoints" },
			{ name: "Applications", description: "Job application endpoints" },
			{ name: "System", description: "Health and metadata" },
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
			schemas: {
				LoginRequest: {
					type: "object",
					additionalProperties: false,
					required: ["email", "password"],
					properties: {
						email: {
							type: "string",
							format: "email",
							example: "user@example.com",
						},
						password: { type: "string", minLength: 1, example: "Secret123!" },
					},
				},
				LoginResponse: {
					type: "object",
					additionalProperties: false,
					required: ["token"],
					properties: {
						token: { type: "string", example: "eyJhbGciOi..." },
					},
				},
				JobRoleSummary: {
					type: "object",
					additionalProperties: false,
					required: [
						"jobRoleId",
						"roleName",
						"closingDate",
						"capabilityName",
						"bandName",
						"locationName",
						"statusName",
					],
					properties: {
						jobRoleId: { type: "integer", minimum: 1, example: 12 },
						roleName: { type: "string", example: "Software Engineer" },
						closingDate: {
							type: "string",
							format: "date-time",
							example: "2026-09-01",
						},
						capabilityName: { type: "string", example: "Engineering" },
						bandName: { type: "string", example: "Band 2" },
						locationName: { type: "string", example: "Birmingham" },
						statusName: {
							type: "string",
							enum: ["OPEN", "CLOSED"],
							example: "OPEN",
						},
					},
				},
				JobRoleDetailed: {
					type: "object",
					additionalProperties: false,
					required: [
						"jobRoleId",
						"roleName",
						"description",
						"responsibilities",
						"sharepointUrl",
						"numberOfOpenPositions",
						"closingDate",
						"statusName",
						"capabilityName",
						"bandName",
						"locationName",
						"addressLine1",
						"addressLine2",
						"postcode",
					],
					properties: {
						jobRoleId: { type: "integer", minimum: 1, example: 12 },
						roleName: { type: "string", example: "Software Engineer" },
						description: { type: "string", example: "Build backend services." },
						responsibilities: {
							type: "string",
							example: "Design APIs, write tests, review pull requests.",
						},
						sharepointUrl: {
							type: "string",
							format: "uri",
							example: "https://contoso.sharepoint.com/job/12",
						},
						numberOfOpenPositions: { type: "integer", minimum: 0, example: 2 },
						closingDate: {
							type: "string",
							format: "date-time",
							nullable: true,
							example: "2026-09-01T00:00:00.000Z",
						},
						statusName: {
							type: "string",
							enum: ["OPEN", "CLOSED"],
							example: "OPEN",
						},
						capabilityName: { type: "string", example: "Engineering" },
						bandName: { type: "string", example: "Band 2" },
						locationName: { type: "string", example: "Birmingham" },
						addressLine1: { type: "string", example: "1 Main St" },
						addressLine2: { type: "string", nullable: true, example: null },
						postcode: { type: "string", example: "B1 1AA" },
					},
				},
				ValidationErrorItem: {
					type: "object",
					additionalProperties: false,
					required: ["field", "message", "code"],
					properties: {
						field: { type: "string", example: "id" },
						message: {
							type: "string",
							example: "ID must be a positive number",
						},
						code: { type: "string", example: "invalid_type" },
					},
				},
				ValidationErrorResponse: {
					type: "object",
					additionalProperties: false,
					required: ["errors"],
					properties: {
						errors: {
							type: "array",
							items: { $ref: "#/components/schemas/ValidationErrorItem" },
						},
					},
				},
				MessageErrorResponse: {
					type: "object",
					additionalProperties: false,
					required: ["message"],
					properties: {
						message: { type: "string", example: "Invalid email or password" },
					},
				},
				ErrorResponse: {
					$ref: "#/components/schemas/MessageErrorResponse",
				},
				HealthResponse: {
					type: "object",
					additionalProperties: false,
					required: ["status", "timestamp"],
					properties: {
						status: { type: "string", example: "UP" },
						timestamp: { type: "string", format: "date-time" },
					},
				},
				RootResponse: {
					type: "object",
					additionalProperties: false,
					required: ["message"],
					properties: {
						message: { type: "string", example: "Welcome to your API!" },
					},
				},
				RegisterResponse: {
					type: "object",
					additionalProperties: false,
					required: ["message"],
					properties: {
						message: { type: "string", example: "User registered" },
					},
				},
				JobRoleApplicationResponse: {
					type: "object",
					additionalProperties: false,
					required: ["applicationId", "jobRoleId", "userId", "cvText"],
					properties: {
						applicationId: { type: "integer", minimum: 1, example: 5 },
						jobRoleId: { type: "integer", minimum: 1, example: 12 },
						userId: { type: "integer", minimum: 1, example: 1 },
						cvText: {
							type: "string",
							example: "I have 5 years of experience...",
						},
					},
				},
				UserApplicationListItem: {
					type: "object",
					additionalProperties: false,
					required: [
						"applicationId",
						"jobRoleId",
						"roleName",
						"applicationDate",
						"cvText",
						"status",
					],
					properties: {
						applicationId: { type: "integer", minimum: 1, example: 5 },
						jobRoleId: { type: "integer", minimum: 1, example: 12 },
						roleName: { type: "string", example: "Software Engineer" },
						applicationDate: {
							type: "string",
							format: "date-time",
							example: "2026-08-12T10:00:00.000Z",
						},
						cvText: { type: "string", example: "My relevant experience..." },
						status: {
							type: "string",
							enum: ["IN_PROGRESS", "HIRED", "REJECTED", "WITHDRAWN"],
						},
					},
				},
				AdminApplicationListItem: {
					type: "object",
					additionalProperties: false,
					required: [
						"applicationId",
						"jobRoleId",
						"applicantName",
						"roleName",
						"applicationDate",
						"cvText",
						"status",
					],
					properties: {
						applicationId: { type: "integer", minimum: 1, example: 5 },
						jobRoleId: { type: "integer", minimum: 1, example: 12 },
						applicantName: {
							type: "string",
							format: "email",
							example: "candidate@example.com",
						},
						roleName: { type: "string", example: "Software Engineer" },
						applicationDate: {
							type: "string",
							format: "date-time",
							example: "2026-08-12T10:00:00.000Z",
						},
						cvText: { type: "string", example: "My relevant experience..." },
						status: {
							type: "string",
							enum: ["IN_PROGRESS", "HIRED", "REJECTED", "WITHDRAWN"],
						},
						actions: {
							type: "object",
							required: ["canHire", "canReject"],
							properties: {
								canHire: { type: "boolean", example: true },
								canReject: { type: "boolean", example: true },
							},
						},
					},
				},
				UpdateApplicationStatusRequest: {
					type: "object",
					additionalProperties: false,
					required: ["status"],
					properties: {
						status: {
							type: "string",
							enum: ["HIRED", "APPROVED", "REJECTED", "REJECT"],
							example: "HIRED",
						},
					},
				},
				CreateJobRoleRequest: {
					type: "object",
					additionalProperties: false,
					required: [
						"roleName",
						"description",
						"responsibilities",
						"sharepointUrl",
						"numberOfOpenPositions",
						"capabilityId",
						"bandId",
						"locationId",
					],
					properties: {
						roleName: { type: "string", example: "Senior Backend Engineer" },
						description: {
							type: "string",
							example: "Build scalable backend services",
						},
						responsibilities: {
							type: "string",
							example:
								"Design APIs, optimize queries, mentor junior developers",
						},
						sharepointUrl: {
							type: "string",
							format: "uri",
							example: "https://contoso.sharepoint.com/sites/jobs/12",
						},
						numberOfOpenPositions: { type: "integer", minimum: 1, example: 2 },
						closingDate: {
							type: "string",
							format: "date-time",
							nullable: true,
							example: "2026-10-01T00:00:00.000Z",
						},
						capabilityId: { type: "integer", minimum: 1, example: 3 },
						bandId: { type: "integer", minimum: 1, example: 2 },
						locationId: { type: "integer", minimum: 1, example: 1 },
					},
				},
				CreateJobRoleResponse: {
					type: "object",
					additionalProperties: false,
					required: ["message", "jobRoleDraft"],
					properties: {
						message: {
							type: "string",
							example: "Mock create endpoint accepted",
						},
						jobRoleDraft: {
							type: "object",
							properties: {
								roleName: { type: "string" },
								description: { type: "string" },
								responsibilities: { type: "string" },
								sharepointUrl: { type: "string" },
								numberOfOpenPositions: { type: "integer" },
								closingDate: { type: "string" },
								capabilityId: { type: "integer" },
								bandId: { type: "integer" },
								locationId: { type: "integer" },
								statusName: { type: "string", example: "OPEN" },
							},
						},
					},
				},
				ApplicationRequest: {
					type: "object",
					additionalProperties: false,
					required: ["cvText"],
					properties: {
						cvText: {
							type: "string",
							example: "I have 5 years of software engineering experience...",
						},
					},
				},
				StatusResponse: {
					type: "object",
					additionalProperties: false,
					required: ["statusId", "statusName"],
					properties: {
						statusId: { type: "integer", minimum: 1, example: 1 },
						statusName: {
							type: "string",
							enum: ["OPEN", "CLOSED"],
							example: "OPEN",
						},
					},
				},
				BandResponse: {
					type: "object",
					additionalProperties: false,
					required: ["bandId", "bandName"],
					properties: {
						bandId: { type: "integer", minimum: 1, example: 3 },
						bandName: { type: "string", example: "Engineer" },
					},
				},
				CapabilityResponse: {
					type: "object",
					additionalProperties: false,
					required: ["capabilityId", "capabilityName"],
					properties: {
						capabilityId: { type: "integer", minimum: 1, example: 1 },
						capabilityName: { type: "string", example: "Software Engineering" },
					},
				},
				LocationResponse: {
					type: "object",
					additionalProperties: false,
					required: ["locationId", "locationName"],
					properties: {
						locationId: { type: "integer", minimum: 1, example: 1 },
						locationName: { type: "string", example: "Belfast" },
					},
				},
			},
		},
	},
	apis: [
		"src/routes/*.ts",
		"src/index.ts",
		"dist/routes/*.js",
		"dist/index.js",
	],
};

export const swaggerSpec = swaggerJsdoc(options);
