import * as chalk from 'chalk';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import * as yaml from 'js-yaml'; 
import { AbstractPackageManager, PackageManagerFactory } from '../lib/package-managers';
import { AbstractAction } from './abstract.action';
import { Input } from '../commands/command.input';
import { repositories } from '../lib/utils/pull-utils/repositories'; 
import { cloneRepo, setupWithDockerfile, setupWithScript, checkDockerContainerExists } from '../lib/utils/pull-utils/serviceUtils';
import { getSpecFilePath } from '../lib/utils/specFilePath';
export class PullAction extends AbstractAction {
  private manager!: AbstractPackageManager;

  public async handle(commandInputs: Input[]) {
    this.manager = await PackageManagerFactory.find();
    const serviceName = commandInputs[0].value as string;

    if (serviceName in repositories.services) {
      await cloneRepo(serviceName, repositories.services);
      const specFilePath = await getSpecFilePath();
      if (specFilePath) {
         this.addServiceToSpec(specFilePath, serviceName);
      }
      await this.setupService(serviceName);
      
    } else {
      console.error(chalk.red(`Service ${serviceName} is not supported.`));
    }
  }

  private async setupService(serviceName: string): Promise<void> {
    const prompt = inquirer.createPromptModule();
    const { setupMethod } = await prompt([
      {
        type: 'list',
        name: 'setupMethod',
        message: `How do you want to set up the ${serviceName}?`,
        choices: ['Dockerfile', 'Startup script'],
      },
    ]);

    if (setupMethod === 'Dockerfile') {
      await setupWithDockerfile(serviceName);
    } else if (setupMethod === 'Startup script') {
      await setupWithScript(serviceName);
    }
  }

  private addServiceToSpec(specFilePath: string, serviceName: string): void {

    if (fs.existsSync(specFilePath)) {
      let specFileContent = fs.readFileSync(specFilePath, 'utf8');
      let specData = yaml.load(specFileContent) as any;

      if (!specData.services) {
        specData.services = [];
      }

      if (!specData.services.includes(serviceName)) {
        specData.services.push(serviceName);
        console.log(chalk.green(`Service ${serviceName} added to spec.yaml.`));

        fs.writeFileSync(specFilePath, yaml.dump(specData), 'utf8');
      } else {
        console.log(chalk.yellow(`Service ${serviceName} is already listed in spec.yaml.`));
      }
    } else {
      const specData = {
        services: [serviceName]
      };
      fs.writeFileSync(specFilePath, yaml.dump(specData), 'utf8');
      console.log(chalk.green(`spec.yaml created and ${serviceName} added.`));
    }
  }
}
