import * as chalk from 'chalk';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { StencilRunner } from '../runners/stencil.runner';
export class ClassTemporal {
  public async create(directory: string,shouldSkipDocker: boolean) {
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);

    try {
      await this.createFileUpload(normalizedDirectory);
      await this.dockerSetup(normalizedDirectory,shouldSkipDocker);

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
  public async dockerSetup(normalizedDirectory: string,shouldSkipDocker: boolean): Promise<void> {
    if(shouldSkipDocker){
      return;
    }
    console.info(chalk.grey(MESSAGES.HUSKY_INITIALISATION_START));

    const stencilRunner = new StencilRunner();
    const stencilCmd = 'docker temporal';

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
