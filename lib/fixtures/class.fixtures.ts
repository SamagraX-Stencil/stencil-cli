import * as chalk from 'chalk';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { NpxRunner } from '../runners/npx.runner';
import { StencilRunner } from '../runners/stencil.runner';

export class ClassFixtures {
  public async create(directory: string) {
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);

    try {
      await this.initializeHuskyFiles(normalizedDirectory);
    } catch (error) {
      console.error('Failed to initialise husky files');
    }

    try {
      await this.initializeFixtureFiles(normalizedDirectory);
    } catch (error) {
      console.error('Failed to generate the fixture files');
    }

    try {
      await this.initializeGithubFiles(normalizedDirectory);
    } catch (error) {
      console.error('Failed to generate the .github file');
    }

    try {
      await this.initializeDevcontainerFiles(normalizedDirectory);
    } catch (error) {
      console.error('Failed to generate the Devcontainer files');
    }
    console.info('Successfully completed file generation in fixtures');
  }

  public async initializeHuskyFiles(
    normalizedDirectory: string,
  ): Promise<void> {
    console.info(chalk.grey(MESSAGES.HUSKY_INITIALISATION_START));
    const npxRunner = new NpxRunner();
    const userServiceCommand = 'husky install';
    const commandArgs = `${userServiceCommand}`;

    try {
      await npxRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.HUSKY_INITIALISATION_ERROR));
    }

    const stencilRunner = new StencilRunner();
    const nestHuskyCmd = 'g husky';

    try {
      await stencilRunner.run(
        nestHuskyCmd,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.HUSKY_INITIALISATION_ERROR));
    }
  }

  public async initializeFixtureFiles(
    normalizedDirectory: string,
  ): Promise<void> {
    console.info(chalk.grey(MESSAGES.FIXTURES_FILES_INITIALIZATION_START));
    const stencilRunner = new StencilRunner();
    const userServiceCommand = 'g fixtures';
    const commandArgs = `${userServiceCommand}`;

    try {
      await stencilRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.FIXTURES_FILES_INITIALIZATION_ERROR));
    }
  }

  public async initializeDevcontainerFiles(
    normalizedDirectory: string,
  ): Promise<void> {
    console.info(chalk.grey(MESSAGES.DEVCONATINER_FILES_INITIALIZATION_START));
    const stencilRunner = new StencilRunner();
    const userServiceCommand = 'g devcontainer';
    const commandArgs = `${userServiceCommand}`;

    try {
      await stencilRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(
        chalk.red(MESSAGES.DEVCONATINER_FILES_INITIALIZATION_ERROR),
      );
    }
  }

  public async initializeGithubFiles(
    normalizedDirectory: string,
  ): Promise<void> {
    console.info(chalk.grey(MESSAGES.GITHUB_FILES_INITIALIZATION_START));
    const stencilRunner = new StencilRunner();
    const userServiceCommand = 'g github';
    const commandArgs = `${userServiceCommand}`;

    try {
      await stencilRunner.run(
        commandArgs,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.GITHUB_FILES_INITIALIZATION_ERROR));
    }
  }
}
