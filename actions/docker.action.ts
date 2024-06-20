import * as chalk from 'chalk';
import * as fs from 'fs';
import { join } from 'path';
import * as fse from 'fs-extra';
import {
  AbstractPackageManager,
  PackageManagerFactory,
} from '../lib/package-managers';
import { AbstractAction } from './abstract.action';
import { Input } from '../commands';
import { MESSAGES } from '../lib/ui';

export class DockerAction extends AbstractAction {
  private manager!: AbstractPackageManager;
  private readonly servicesToCheck = ['logging', 'monitoring', 'temporal'];

  public async handle(commandInputs: Input[]) {
    this.manager = await PackageManagerFactory.find();
    await this.generateDockerFiles(commandInputs);
  }

  private async generateDockerFiles(inputServices: Input[]): Promise<void> {
    const basePath = join(__dirname, '..', 'node_modules', '@samagra-x', 'schematics', 'dist', 'lib', 'docker', 'files', 'ts');

    const serviceNames = inputServices
      .map(input => input.value)
      .filter(value => typeof value === 'string');

    const validServices = serviceNames.filter(service => this.servicesToCheck.includes(service.toString()));

    if (validServices.length === 0) {
      console.error(chalk.red(MESSAGES.NO_VALID_SERVICES_PROVIDED));
      return;
    }

    const availableServices = validServices.filter(service => {
      const servicePath = join(basePath, service.toString());
      return fs.existsSync(servicePath);
    });

    if (availableServices.length === 0) {
      console.error(chalk.red(MESSAGES.NO_VALID_SERVICES_PROVIDED));
      return;
    }

    availableServices.forEach(service => {
      const servicePath = join(basePath, service.toString());
      this.copyDirectory(service.toString(), servicePath);
    });
  }

  private copyDirectory(service: string, servicePath: string): void {
    const destinationPath = join(process.cwd(), 'docker', service);

    try {
      fse.copySync(servicePath, destinationPath);
      console.info(chalk.green(MESSAGES.DOCKER_FILES_GENERATED(service)));
    } catch (error) {
      console.error(chalk.red(MESSAGES.DOCKER_FILES_GENERATION_ERROR(service)));
    }
  }
}