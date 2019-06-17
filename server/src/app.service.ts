import { Injectable } from '@nestjs/common';
import * as LdapJs from 'ldapjs';

import { GetLdapDto } from './dtos/get-ldap.dto';
import { AddLdapDto } from './dtos/add-ldap.dto';
import { ModifyLdapDto } from './dtos/modify-ldap.dto';

@Injectable()
export class AppService {

	private client; // -- Connector to the openldap server

	constructor() {
		// console.error("process.env.LDAP_URL : ", process.env.LDAP_URL)
		// console.error("process.env.LDAP_ROOT_DN : ", process.env.LDAP_ROOT_DN)
		// console.error("process.env.LDAP_PASSWORD : ", process.env.LDAP_PASSWORD)
		this.client = LdapJs.createClient({
			url : process.env.LDAP_URL
		});

		this.client.bind(process.env.LDAP_ROOT_DN, process.env.LDAP_PASSWORD, function(err) {
			if (err)
			{
				console.log("There was a bind error: ", err);
				throw err;
			}
		});
	}

	buildDn(id: string | number, groupType: string): string {
		return "ou=" + id + ",ou=" + groupType + ",dc=kitset,dc=localhost";
	}

	search(id: string | number, groupType: string, options): Promise<GetLdapDto> {

		return new Promise((thenCb, catchCb) => {

			var dn = this.buildDn(id, groupType);
			var dataToReturn: GetLdapDto;

			this.client.search(dn, options, (err, res) => {
				res.on("searchEntry", (entry) => {
					dataToReturn = entry.object;
				});
				res.on("searchReference", function(referral) {
					console.log("Referral: ", referral.uris.join());
				});
				res.on("error", (err) => {
					catchCb(err);
				});
				res.on("end", (result) => {
					thenCb(dataToReturn);
				});
			})

		})
	}

	add(id: string | number, groupType: string, ldapData: AddLdapDto): Promise<AddLdapDto> {

		return new Promise((thenCb, catchCb) => {

			var dn = this.buildDn(id, groupType);

			if (!ldapData.hasOwnProperty('keycloakGroupId'))
			{
				ldapData.keycloakGroupId = 0;
			}
			if (!ldapData.hasOwnProperty('keycloakOwnersGroupId'))
			{
				ldapData.keycloakOwnersGroupId = 0;
			}
			if (!ldapData.hasOwnProperty('keycloakAdminsGroupId'))
			{
				ldapData.keycloakAdminsGroupId = 0;
			}
			if (!ldapData.hasOwnProperty('keycloakDevelopersGroupId'))
			{
				ldapData.keycloakDevelopersGroupId = 0;
			}
			if (!ldapData.hasOwnProperty('keycloakViewersGroupId'))
			{
				ldapData.keycloakViewersGroupId = 0;
			}

			this.client.add(dn, ldapData, (err) => {
				if (err)
				{
					catchCb(err);
				}
				thenCb(ldapData);
			})
		})
	}

	modify(id: string | number, groupType: string, ldapData: ModifyLdapDto) : Promise<ModifyLdapDto>
	{
		return new Promise((thenCb, catchCb) => {

			var dn = this.buildDn(id, groupType);

			var modifyPromises = [];

			var modifyPromise = function(client: LdapJs.Client, dn: string, changeData: LdapJs.Change)
			{
				return new Promise((thenCb, catchCb) => {
					client.modify(dn, changeData, (err) => {
						if (err)
						{
							catchCb(err);
						}
						thenCb(changeData);
					})
				})
			}

			// -- Because we can only update 1 attribute at a time then we will need to iterate over all objs and add to the modifyPromises obj
			for (var ldapAttrName in ldapData)
			{
				var modification = {};
					modification[ldapAttrName] = ldapData[ldapAttrName];

				// -- Create the change data which will be sent to the modifyPromise
				var changeData = new LdapJs.Change({
					operation: "replace",
					modification: modification
				});

				// -- Fire a modify promise and add it to the promiseAll array
				modifyPromises.push(modifyPromise(this.client, dn, changeData));
			}

			// -- Finally lets add a catch for the modify promises
			Promise.all(modifyPromises)
				.then((promiseAllData) => {
					thenCb(ldapData);
				})
				.catch((promiseAllError) => {
					catchCb(promiseAllError);
				});
		});
	}

	async delete(teamId: string | number, groupType: string): Promise<string> {

		return new Promise((thenCb, catchCb) => {

			var dn = this.buildDn(teamId, groupType);

			this.client.del(dn, (err) => {
				if (err)
				{
					catchCb(err);
				}
				thenCb(dn);
			});
		});
	}

	async searchTeam(teamId: string | number): Promise<GetLdapDto> {

		try
		{
			var options = {
				attributes: ["keycloakGroupId", "keycloakOwnersGroupId", "keycloakAdminsGroupId", "keycloakDevelopersGroupId", "keycloakViewersGroupId"]
			}

			var searchResults = await this.search(teamId, "teams", options);
			return searchResults;
		}
		catch(err)
		{
			throw err;
		}
	}

	async addTeam(teamId: string | number) : Promise<AddLdapDto> {

		try
		{
			var ldapData: AddLdapDto = {
				ou : teamId,
				objectclass : ["organizationalUnit", "extensibleObject", "top"]
			}

			var addResults = await this.add(teamId, "teams", ldapData);
			return addResults;
		}
		catch(err)
		{
			throw err;
		}
	}

	async modifyTeam(teamId: string | number, ldapData: ModifyLdapDto): Promise<ModifyLdapDto> {

		try
		{
			var modifiedData = await this.modify(teamId, "teams", ldapData);
			return modifiedData;
		}
		catch(err)
		{
			throw err;
		}
	}

	async deleteTeam(teamId: string | number): Promise<string> {

		try
		{
			var deletedDn = await this.delete(teamId, "teams");
			return deletedDn;
		}
		catch(err)
		{
			throw err;
		}
	}

	getHello(): string {
		return 'Hello World!';
	}
}
