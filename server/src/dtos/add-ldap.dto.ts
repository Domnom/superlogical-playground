export class AddLdapDto {

	keycloakGroupId? : number; // -- Set once the keycloak group has been created via microservice-keycoak
	keycloakOwnersGroupId? : number; // -- Set with keycloakGroupId
	keycloakAdminsGroupId? : number; // -- Set with keycloakGroupId
	keycloakDevelopersGroupId? : number; // -- Set with keycloakGroupId
	keycloakViewersGroupId? : number; // -- Set with keycloakGroupId
	ou : number | string; // -- Organization Unit. Openldap key used for DN
	objectclass : string[]; // -- Openldap organisational
}