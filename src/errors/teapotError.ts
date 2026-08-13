export class TeapotError extends Error {
	public constructor(message: string = "I'm a teapot") {
		super(message);
	}

	public readonly statusCode: number = 418;
}
