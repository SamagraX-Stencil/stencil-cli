import * as chalk from 'chalk';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { StencilRunner } from '../runners/stencil.runner';

export class ClassTemporal {
  public async create(directory: string) {
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);

    try {
      await this.createFileUpload(normalizedDirectory);
    } catch (error) {
      console.error('Failed setting up temporal');
    }

    console.info('Successfully setup temporal in the project');
  }

  public async createFileUpload(normalizedDirectory: string): Promise<void> {
    console.info(chalk.grey(MESSAGES.HUSKY_INITIALISATION_START));

    const stencilRunner = new StencilRunner();
    const stencilCmd = 'g service-temporal';

    try {
      await stencilRunner.run(
        stencilCmd,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.HUSKY_INITIALISATION_ERROR));
    }
  }
}
