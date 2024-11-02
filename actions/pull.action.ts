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
import { exec } from 'child_process';
import { StencilRunner } from '../lib/runners/stencil.runner';
import { join } from 'path';
import { NpmRunner } from '../lib/runners/npm.runner';
import { MESSAGES } from '../lib/ui';

export class PullAction extends AbstractAction {
  private manager!: AbstractPackageManager;

  public async handle(commandInputs: Input[],options: Input[]) {
    this.manager = await PackageManagerFactory.find();
    const serviceName = commandInputs[0].value as string;
    const init = options.find((option) => option.name === 'init')!.value as boolean;

    if (init) {
      if (!fs.existsSync('frontend')) {
        console.info(MESSAGES.INITIALIZING_FRONTEND);
        await this.runStencilPullService();
        console.info(MESSAGES.INSTALLING_DEPENDENCIES);
        await this.installDependencies();
      } else {
        console.info(chalk.yellow(MESSAGES.FRONTEND_ALREADY_INITIALIZED));
      }
    }
  
    if (serviceName === 'preview') {
      const specFilePath = await getSpecFilePath();
      if (specFilePath) {
        await this.launchAstroFrontend(specFilePath);
        return;
      } else {
        console.error(chalk.red(MESSAGES.NO_SPEC_FOUND));
        return;
      }
    }
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
  private async runStencilPullService() {
    const stencilRunner = new StencilRunner();
    const prismaUpdateCommand = 'g pullservice';
    const commandArgs = `${prismaUpdateCommand}`;

    try {
      console.info(chalk.green(MESSAGES.PULL_INSTALLATION_IN_PROGRESS));
      await stencilRunner.run(
        commandArgs,
        false,
        join(process.cwd()),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.PULL_INSTALLATION_ERROR));
    }

  }
  
  private async installDependencies() {
    const npmRunner = new NpmRunner();
    const userServiceCommand = 'install';
    const commandArgs = `${userServiceCommand}`;

    try {
      await npmRunner.run(
        commandArgs,
        false,
        join(process.cwd(), 'frontend'),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.PULL_INSTALLATION_ERROR));
    }

  }

  private async setupService(serviceName: string): Promise<void> {
    const prompt = inquirer.createPromptModule();
    const { setupMethod } = await prompt([
      {
        type: 'list',
        name: 'setupMethod',
        message: `How do you want to set up the ${serviceName}?`,
        choices: ['Dockerfile', 'Startup script', 'Skip'],
      },
    ]);

    if (setupMethod === 'Dockerfile') {
      await setupWithDockerfile(serviceName);
    } else if (setupMethod === 'Startup script') {
      await setupWithScript(serviceName);
    } else{
      console.info(chalk.yellow(`Skipping setup for ${serviceName}.`));
      return;
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
        console.info(chalk.green(`Service ${serviceName} added to spec.yaml.`));

        fs.writeFileSync(specFilePath, yaml.dump(specData), 'utf8');
      } else {
        console.info(chalk.yellow(`Service ${serviceName} is already listed in spec.yaml.`));
      }
    } else {
      const specData = {
        services: [serviceName]
      };
      fs.writeFileSync(specFilePath, yaml.dump(specData), 'utf8');
      console.info(chalk.green(`spec.yaml created and ${serviceName} added.`));
    }
  }
  private async launchAstroFrontend(specFilePath: string): Promise<void> {
    console.info(chalk.green('Building Astro frontend...'));

    try{
      exec('npx astro build', { cwd: './frontend' }, (error, stdout, stderr) => {
        if (error) {
          console.error(chalk.red(`Error building Astro frontend: ${error.message}`));
          return;
        }
  
        console.info(chalk.green(stdout));
  
        if (stderr) {
          console.error(chalk.yellow(stderr));
        }
  
        console.info(chalk.green('Serving Astro frontend...'));
        exec('npx serve ./frontend/dist', (serveError, serveOut, serveErr) => {
          if (serveError) {
            console.error(chalk.red(`Error serving Astro frontend: ${serveError.message}`));
            return;
          }
  
          console.info(chalk.green(serveOut));
          if (serveErr) {
            console.error(chalk.yellow(serveErr));
          }
        });
      });
  
    }catch(error){
      console.error(chalk.red(`Error building Astro frontend: ${error.message}`));
      return;
    }
  }
}