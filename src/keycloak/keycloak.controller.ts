import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	UseInterceptors,
	ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KeycloakService } from './keycloak.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenDto } from './dto/access-token.dto';
import { ErrorHandlingInterceptor } from 'src/common/interceptors/ErrorHandlingInterceptor';

@Controller('keycloak')
@ApiTags('keycloak')
@UseInterceptors(ErrorHandlingInterceptor)
export class KeycloakController {
	constructor(private readonly keycloakService: KeycloakService) {}

	@Get('/getAdminAccesToken')
	async getAdminAccessToken(): Promise<string> {
		return this.keycloakService.getAdminAccessToken();
	}

	@Post('/signUp')
	@HttpCode(HttpStatus.CREATED)
	async signUp(
		@Body(new ValidationPipe()) createUserDto: CreateUserDto
	): Promise<void | ErrorResponse> {
		return await this.keycloakService.createUser(createUserDto);
	}

	@Post('/signIn')
	@HttpCode(HttpStatus.OK)
	async signIn(
		@Body(new ValidationPipe()) signInDto: SignInDto
	): Promise<KeycloakAtRt | ErrorResponse> {
		return await this.keycloakService.getAccessAndRefreshTokens(signInDto);
	}

	@Post('/logout')
	@HttpCode(HttpStatus.NO_CONTENT)
	async logout(
		@Body(new ValidationPipe()) refreshTokenDto: RefreshTokenDto
	): Promise<void | ErrorResponse> {
		return this.keycloakService.logout(refreshTokenDto.refresh_token);
	}

	@Post('/refresh')
	@HttpCode(HttpStatus.OK)
	async refreshTokens(
		@Body(new ValidationPipe()) refreshTokenDto: RefreshTokenDto
	): Promise<KeycloakAtRt | ErrorResponse> {
		return this.keycloakService.refreshTokens(refreshTokenDto.refresh_token);
	}

	@Post('/getUserInfo')
	@HttpCode(HttpStatus.OK)
	async getUserInfo(
		@Body(new ValidationPipe()) accessTokenDto: AccessTokenDto
	): Promise<UserInfo | ErrorResponse> {
		return this.keycloakService.getUserInfo(accessTokenDto.access_token);
	}
}
