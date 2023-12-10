import * as chalk from 'chalk';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { StencilRunner } from '../runners/stencil.runner';

export class ClassMonitoring {
  public async create(directory: string) {
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);
    try {
      await this.initializeUserFiles(normalizedDirectory);
    } catch (error) {
      console.error('Failed to update app.module.ts file with monitoring');
    }

    console.info('Successfully updated app.module.ts file with monitoring');
  }

  public async initializeUserFiles(normalizedDirectory: string): Promise<void> {
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
}
