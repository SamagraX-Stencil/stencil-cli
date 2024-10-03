import * as chalk from 'chalk';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { StencilRunner } from '../runners/stencil.runner';
export class ClassMonitoring {
  public async addImport(directory: string) {
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);
    try {
      await this.initializeImport(normalizedDirectory);
    } catch (error) {
      console.error('Failed to update app.module.ts file with monitoring');
    }

    console.info('Successfully updated app.module.ts file with monitoring');
  }

  public async initializeImport(normalizedDirectory: string): Promise<void> {
    const stencilRunner = new StencilRunner();
    const userServiceCommand = 'g monitoring';
    const commandArgs = `${userServiceCommand}`;

    try {
      await stencilRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.MONITORING_INSTALL_ERROR));
    }
  }

  public async createFiles(directory: string,  shouldSkipDocker : boolean,) {
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);
    try {
      await this.addImport(normalizedDirectory);
      await this.generateFiles(normalizedDirectory,shouldSkipDocker);
    } catch (error) {
      console.error('Failed to create the monitor files');
    }

    console.info('Successfully created the monitor files');
  }

  public async generateFiles(normalizedDirectory: string,shouldSkipDocker: boolean): Promise<void> {
    if(shouldSkipDocker){
      return;
    }
    const stencilRunner = new StencilRunner();
    const userServiceCommand = 'docker monitoringService';
    const commandArgs = `${userServiceCommand}`;

    try {
      await stencilRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.MONITOR_GENERATION_ERROR));
    }
  }
}
