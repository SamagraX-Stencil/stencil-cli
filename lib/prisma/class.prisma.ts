import * as chalk from 'chalk';
import * as ora from 'ora';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { NpxRunner } from '../runners/npx.runner';
import { StencilRunner } from '../runners/stencil.runner';

export class ClassPrisma {
  public async create(directory: string, inputPackageManager: string) {
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

    try {
      await this.updatePrismaFiles(normalizedDirectory);
    } catch (error) {
      spinner.fail();
      console.error('Failed to update the prisma schema files');
    }

    try {
      await this.generatePrisma(normalizedDirectory);
    } catch (error) {
      spinner.fail();
      console.error('Failed to run the prisma generate command');
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
    const stencilRunner = new StencilRunner();
    const prismaServiceInitCommand = 'g service-prisma prisma';
    const commandArgs = `${prismaServiceInitCommand}`;

    try {
      console.info(MESSAGES.PRISMA_SERVICE_INITIALIZATION);
      await stencilRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.PRISMA_SERVICE_INITIALIZATION_ERROR));
    }
  }

  public async updatePrismaFiles(normalizedDirectory: string): Promise<void> {
    const stencilRunner = new StencilRunner();
    const prismaUpdateCommand = 'g prisma';
    const commandArgs = `${prismaUpdateCommand}`;

    try {
      console.info(MESSAGES.PRISMA_SCHEMA_UPDATE);
      await stencilRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.PRISMA_SCHEMA_UPDATE_ERROR));
    }
  }

  public async generatePrisma(normalizedDirectory: string): Promise<void> {
    const npxRunner = new NpxRunner();
    const prismaGenerateCommand = 'prisma generate';
    const commandArgs = `${prismaGenerateCommand}`;

    try {
      console.info(MESSAGES.PRISMA_GENERATE_START);
      await npxRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.PRISMA_GENERATE_ERROR));
    }
  }
}
