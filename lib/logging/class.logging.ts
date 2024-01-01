import * as chalk from 'chalk';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { StencilRunner } from '../runners/stencil.runner';

export class ClassLogging {
  public async create(directory: string) {
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);

    try {
      await this.createFileUpload(normalizedDirectory);
    } catch (error) {
      console.error('Failed to create the Logging files');
    }

    console.info('Successfully created the Logging files');
  }

  public async createFileUpload(normalizedDirectory: string): Promise<void> {
    console.info(chalk.grey(MESSAGES.LOGGING_START));

    const stencilRunner = new StencilRunner();
    const stencilCmd = 'g logging';

    try {
      await stencilRunner.run(
        stencilCmd,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.LOGGING_ERROR));
    }
  }
}
