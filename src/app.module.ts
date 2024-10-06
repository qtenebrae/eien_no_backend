import { Module } from '@nestjs/common';
import { KeycloakModule } from './keycloak/keycloak.module';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		KeycloakModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
