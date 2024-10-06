interface UserInfo {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	preferred_username: string;
	email: string;
	email_verified: string;
	realm_access: {
		roles: string[];
	};
	system_roles: string[];
	username: string;
	active: boolean;
}
