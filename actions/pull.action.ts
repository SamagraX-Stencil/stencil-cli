import * as chalk from 'chalk';
import * as fs from 'fs';
import { AbstractPackageManager, PackageManagerFactory } from '../lib/package-managers';
import { AbstractAction } from './abstract.action';
import { Input } from '../commands/command.input';
import * as inquirer from 'inquirer';
import { repositories } from '../lib/utils/pull-utils/repositories'; 
import { cloneRepo, setupWithDockerfile, setupWithScript, checkDockerContainerExists } from '../lib/utils/pull-utils/serviceUtils'; // Adjust the path accordingly

export class PullAction extends AbstractAction {
  private manager!: AbstractPackageManager;

  public async handle(commandInputs: Input[]) {
    this.manager = await PackageManagerFactory.find();
    const serviceName = commandInputs[0].value as string;

    if (serviceName in repositories.services) {
      await cloneRepo(serviceName, repositories.services);
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
}
