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
                        email: { type: "string", format: "email", example: "user@example.com" },
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
                            nullable: true,
                            example: "2026-09-01T00:00:00.000Z",
                        },
                        capabilityName: { type: "string", example: "Engineering" },
                        bandName: { type: "string", example: "Band 2" },
                        locationName: { type: "string", example: "Birmingham" },
                        statusName: { type: "string", enum: ["OPEN", "CLOSED"], example: "OPEN" },
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
                        statusName: { type: "string", enum: ["OPEN", "CLOSED"], example: "OPEN" },
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
                    required: ["field", "message"],
                    properties: {
                        field: { type: "string", example: "id" },
                        message: { type: "string", example: "ID must be a positive number" },
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
                    type: "object",
                    additionalProperties: false,
                    required: ["error"],
                    properties: {
                        error: { type: "string", example: "Internal Server Error" },
                    },
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
            },
        },
    },
    apis: ["src/routes/*.ts", "src/index.ts", "dist/routes/*.js", "dist/index.js"],
};

export const swaggerSpec = swaggerJsdoc(options);