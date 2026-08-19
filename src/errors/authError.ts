const LOGIN_ERROR = "Invalid email or password";
const TOKEN_ERROR = "Invalid token";

class AuthError extends Error {
	public constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
	}
}

export { AuthError, LOGIN_ERROR, TOKEN_ERROR };
