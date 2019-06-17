import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AddLdapDto } from './dtos/add-ldap.dto';
import { ModifyLdapDto } from './dtos/modify-ldap.dto';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	async getHello(): Promise<AddLdapDto> {

		try
		{
			// var result = await this.appService.addTeam(555);

			var result = await this.appService.searchTeam(555);

			// var result = await this.appService.modifyTeam(555, { keycloakGroupId : 30, keycloakAdminsGroupId : 20, keycloakViewersGroupId : 40 });

			// var result = await this.appService.deleteTeam(555);



			return result;
		}
		catch (err)
		{
			return err;
		}
	}
}
