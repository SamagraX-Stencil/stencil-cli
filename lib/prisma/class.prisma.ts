import * as chalk from 'chalk';
import * as ora from 'ora';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { NpxRunner } from '../runners/npx.runner';
import { NestRunner } from '../runners/nest.runner';

export class ClassPrisma {
  public async create(directory: string) {
    const spinner = ora({
      spinner: {
        interval: 120,
        frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
      },
      text: MESSAGES.PRISMA_INSTALLATION_START,
    });
    spinner.start();
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);

    try {
      await this.initializePrisma(normalizedDirectory);
    } catch (error) {
      spinner.fail();
      console.error('Failed to run prisma init command');
    }

    try {
      await this.initialsePrismaService(normalizedDirectory);
    } catch (error) {
      spinner.fail();
      console.error('Failed to initialise the prisma service files');
    }

    spinner.succeed();
    console.info('Successfully installed and created all prisma related files');
  }

  public async initializePrisma(normalizedDirectory: string): Promise<void> {
    const npxRunner = new NpxRunner();
    const prismaInitCommand = 'prisma init';
    const commandArgs = `${prismaInitCommand}`;

    try {
      console.info(MESSAGES.PRISMA_SCHEMA_INITIALIZATION);

      await npxRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.PRISMA_SCHEMA_INITIALIZATION_ERROR));
    }
  }

  public async initialsePrismaService(
    normalizedDirectory: string,
  ): Promise<void> {
    const nestRunner = new NestRunner();
    const prismaServiceInitCommand = 'g service-prisma prisma';
    const commandArgs = `${prismaServiceInitCommand}`;

    try {
      console.info(MESSAGES.PRISMA_SERVICE_INITIALIZATION);
      await nestRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.PRISMA_SERVICE_INITIALIZATION_ERROR));
    }
  }
}
