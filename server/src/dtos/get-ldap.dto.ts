export class GetLdapDto {

	dn: string;
	controls : any[];
	keycloakGroupId: number; // -- Set once the keycloak group has been created via microservice-keycoak
	keycloakOwnersGroupId: number; // -- Set with keycloakGroupId
	keycloakAdminsGroupId: number; // -- Set with keycloakGroupId
	keycloakDevelopersGroupId: number; // -- Set with keycloakGroupId
	keycloakViewersGroupId: number; // -- Set with keycloakGroupId
}