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
    const userServiceCommand = 'g monitorModule';
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

  public async createFiles(directory: string) {
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);
    try {
      await this.generateFiles(normalizedDirectory);
    } catch (error) {
      console.error('Failed to create the monitor files');
    }

    console.info('Successfully created the monitor files');
  }

  public async generateFiles(normalizedDirectory: string): Promise<void> {
    const stencilRunner = new StencilRunner();
    const userServiceCommand = 'g monitor';
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
