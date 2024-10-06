import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import axios from 'axios';
import { SignInDto } from './dto/sign-in.dto';
import { KeycloakError } from 'src/common/errors/keycloak-error';

@Injectable()
export class KeycloakService {
	constructor(private configService: ConfigService) {}

	private readonly keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
	private readonly realm = this.configService.get<string>('REALM');

	private readonly clientId = this.configService.get<string>('CLIENT_ID');
	private readonly clientIdAdmin = this.configService.get<string>('CLIENT_ID_ADMIN');
	private readonly clientSecret = this.configService.get<string>('CLIENT_SECRET');
	private readonly clientSecretAdmin = this.configService.get<string>('CLIENT_SECRET_ADMIN');

	async getAdminAccessToken(): Promise<string> {
		const data = new URLSearchParams({
			client_id: this.clientIdAdmin,
			client_secret: this.clientSecretAdmin,
			grant_type: 'client_credentials'
		});

		const response = await axios.post(
			`${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
			data
		);

		return response.data.access_token;
	}

	async createUser(createUserDto: CreateUserDto): Promise<void | ErrorResponse> {
		const data = {
			enabled: true,
			email: createUserDto.email,
			// firstName: 'firstName',
			// lastName: 'lastName',
			username: createUserDto.username,
			credentials: [
				{
					type: 'password',
					value: createUserDto.password,
					temporary: false
				}
			]
		};

		try {
			await axios.post(`${this.keycloakUrl}/admin/realms/${this.realm}/users`, data, {
				headers: {
					Authorization: `Bearer ${await this.getAdminAccessToken()}`
				}
			});
		} catch (error) {
			throw new KeycloakError(error.status, error.message);
		}
	}

	async getAccessAndRefreshTokens(signInDto: SignInDto): Promise<KeycloakAtRt | ErrorResponse> {
		const data = {
			client_id: `${this.clientId}`,
			client_secret: `${this.clientSecret}`,
			grant_type: 'password',
			username: signInDto.username,
			password: signInDto.password
		};

		try {
			const response = await axios.post(
				`${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
				data,
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			return response.data;
		} catch (error) {
			throw new KeycloakError(error.status, error.message);
		}
	}

	async logout(refresh_token: string): Promise<void | ErrorResponse> {
		const data = {
			client_id: `${this.clientId}`,
			client_secret: `${this.clientSecret}`,
			refresh_token: refresh_token
		};

		try {
			await axios.post(
				`${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/logout`,
				data,
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);
		} catch (error) {
			throw new KeycloakError(error.status, error.message);
		}
	}

	async refreshTokens(refresh_token: string): Promise<KeycloakAtRt | ErrorResponse> {
		const data = {
			client_id: `${this.clientId}`,
			client_secret: `${this.clientSecret}`,
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		};

		try {
			const response = await axios.post(
				`${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
				data,
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			return response.data;
		} catch (error) {
			throw new KeycloakError(error.status, error.message);
		}
	}

	async getUserInfo(access_token: string): Promise<UserInfo | ErrorResponse> {
		const data = {
			client_id: `${this.clientId}`,
			client_secret: `${this.clientSecret}`,
			token: access_token
		};

		try {
			const response = await axios.post<UserInfo>(
				`${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`,
				data,
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			return response.data;
		} catch (error) {
			throw new KeycloakError(error.status, error.message);
		}
	}
}
