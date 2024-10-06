export class KeycloakError extends Error implements ErrorResponse {
	public code: string;
	public status: number;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;

		Object.setPrototypeOf(this, KeycloakError.prototype);
	}
}
