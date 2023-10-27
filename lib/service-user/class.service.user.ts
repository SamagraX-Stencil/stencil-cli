import * as chalk from 'chalk';
import * as ora from 'ora';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { NestRunner } from '../runners/nest.runner';

export class ClassUserService {
  public async create(directory: string) {
    const spinner = ora({
      spinner: {
        interval: 120,
        frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
      },
      text: MESSAGES.USER_SERVICE_FILE_INITIALIZATION_START,
    });
    spinner.start();
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);

    try {
      await this.initializeUserFiles(normalizedDirectory);
    } catch (error) {
      spinner.fail();
      console.error('Failed to update app.module.ts file with user service');
    }

    spinner.succeed();
    console.info('Successfully updated app.module.ts file with user service');
  }

  public async initializeUserFiles(normalizedDirectory: string): Promise<void> {
    const nestRunner = new NestRunner();
    const userServiceCommand = 'g service-user';
    const commandArgs = `${userServiceCommand}`;

    try {
      await nestRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.USER_SERVICE_FILE_INITIALIZATION_ERROR));
    }
  }
}
