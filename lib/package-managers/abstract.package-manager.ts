import * as chalk from 'chalk';
import { readFile } from 'fs';
import * as ora from 'ora';
import { join } from 'path';
import { AbstractRunner } from '../runners/abstract.runner';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { PackageManagerCommands } from './package-manager-commands';
import { ProjectDependency } from './project.dependency';
import { NpxRunner } from '../runners/npx.runner';
import { StencilRunner } from '../runners/stencil.runner';

export abstract class AbstractPackageManager {
  constructor(protected runner: AbstractRunner) {}

  public async install(
    directory: string,
    packageManager: string,
    shouldInitializePrisma?: boolean,
    shouldInitializeUserService?: boolean,
    shouldInstallMonitoring?: boolean,
  ) {
    const spinner = ora({
      spinner: {
        interval: 120,
        frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
      },
      text: MESSAGES.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS,
    });
    spinner.start();
    try {
      const commandArgs = `${this.cli.install} ${this.cli.silentFlag}`;
      const collect = true;
      const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);

      await this.runner.run(
        commandArgs,
        collect,
        join(process.cwd(), normalizedDirectory),
      );
      if (shouldInitializePrisma) {
        try {
          const prismaCommandArg = `${this.cli.add} prisma ${this.cli.silentFlag}`;
          await this.runner.run(
            prismaCommandArg,
            collect,
            join(process.cwd(), normalizedDirectory),
          );

          const prismaClientCommandArg = `${this.cli.add} @prisma/client ${this.cli.silentFlag}`;
          await this.runner.run(
            prismaClientCommandArg,
            collect,
            join(process.cwd(), normalizedDirectory),
          );
        } catch (error) {
          console.error(chalk.red(MESSAGES.PRISMA_INSTALLATION_FAILURE));
        }
      }

      if (shouldInitializeUserService) {
        try {
          const CommandArg = `${this.cli.add} @techsavvyash/user-service ${this.cli.silentFlag}`;
          await this.runner.run(
            CommandArg,
            collect,
            join(process.cwd(), normalizedDirectory),
          );
        } catch (error) {
          console.error(chalk.red(MESSAGES.USER_SERVICE_INSTALLATION_ERROR));
        }
      }

      if (shouldInstallMonitoring) {
        try {
          const CommandArg = `${this.cli.add} @techsavvyash/nestjs-monitor ${this.cli.silentFlag}`;
          await this.runner.run(
            CommandArg,
            collect,
            join(process.cwd(), normalizedDirectory),
          );
        } catch (error) {
          console.error(chalk.red(MESSAGES.USER_SERVICE_INSTALLATION_ERROR));
        }
      }

      spinner.succeed();
      console.info();
      console.info(MESSAGES.PACKAGE_MANAGER_INSTALLATION_SUCCEED(directory));
      console.info(MESSAGES.GET_STARTED_INFORMATION);
      console.info();
      console.info(chalk.gray(MESSAGES.CHANGE_DIR_COMMAND(directory)));
      console.info(chalk.gray(MESSAGES.START_COMMAND(packageManager)));
      console.info();
    } catch {
      spinner.fail();
      const commandArgs = this.cli.install;
      const commandToRun = this.runner.rawFullCommand(commandArgs);
      console.error(
        chalk.red(
          MESSAGES.PACKAGE_MANAGER_INSTALLATION_FAILED(
            chalk.bold(commandToRun),
          ),
        ),
      );
    }
  }

  public async version(): Promise<string> {
    const commandArguments = '--version';
    const collect = true;
    return this.runner.run(commandArguments, collect) as Promise<string>;
  }

  public async addProduction(
    dependencies: string[],
    tag: string,
  ): Promise<boolean> {
    const command: string = [this.cli.add, this.cli.saveFlag]
      .filter((i) => i)
      .join(' ');
    const args: string = dependencies
      .map((dependency) => `${dependency}@${tag}`)
      .join(' ');
    const spinner = ora({
      spinner: {
        interval: 120,
        frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
      },
      text: MESSAGES.PACKAGE_MANAGER_PRODUCTION_INSTALLATION_IN_PROGRESS,
    });
    spinner.start();
    try {
      await this.add(`${command} ${args}`);
      spinner.succeed();
      return true;
    } catch {
      spinner.fail();
      return false;
    }
  }

  public async addDevelopment(dependencies: string[], tag: string) {
    const command = `${this.cli.add} ${this.cli.saveDevFlag}`;
    const args: string = dependencies
      .map((dependency) => `${dependency}@${tag}`)
      .join(' ');
    await this.add(`${command} ${args}`);
  }

  private async add(commandArguments: string) {
    const collect = true;
    await this.runner.run(commandArguments, collect);
  }

  public async getProduction(): Promise<ProjectDependency[]> {
    const packageJsonContent = await this.readPackageJson();
    const packageJsonDependencies: any = packageJsonContent.dependencies;
    const dependencies = [];

    for (const [name, version] of Object.entries(packageJsonDependencies)) {
      dependencies.push({ name, version });
    }

    return dependencies as ProjectDependency[];
  }

  public async getDevelopment(): Promise<ProjectDependency[]> {
    const packageJsonContent = await this.readPackageJson();
    const packageJsonDevDependencies: any = packageJsonContent.devDependencies;
    const dependencies = [];

    for (const [name, version] of Object.entries(packageJsonDevDependencies)) {
      dependencies.push({ name, version });
    }

    return dependencies as ProjectDependency[];
  }

  private async readPackageJson(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      readFile(
        join(process.cwd(), 'package.json'),
        (error: NodeJS.ErrnoException | null, buffer: Buffer) => {
          if (error !== undefined && error !== null) {
            reject(error);
          } else {
            resolve(JSON.parse(buffer.toString()));
          }
        },
      );
    });
  }

  public async updateProduction(dependencies: string[]) {
    const commandArguments = `${this.cli.update} ${dependencies.join(' ')}`;
    await this.update(commandArguments);
  }

  public async updateDevelopment(dependencies: string[]) {
    const commandArguments = `${this.cli.update} ${dependencies.join(' ')}`;
    await this.update(commandArguments);
  }

  private async update(commandArguments: string) {
    const collect = true;
    await this.runner.run(commandArguments, collect);
  }

  public async upgradeProduction(dependencies: string[], tag: string) {
    await this.deleteProduction(dependencies);
    await this.addProduction(dependencies, tag);
  }

  public async upgradeDevelopment(dependencies: string[], tag: string) {
    await this.deleteDevelopment(dependencies);
    await this.addDevelopment(dependencies, tag);
  }

  public async deleteProduction(dependencies: string[]) {
    const command: string = [this.cli.remove, this.cli.saveFlag]
      .filter((i) => i)
      .join(' ');
    const args: string = dependencies.join(' ');
    await this.delete(`${command} ${args}`);
  }

  public async deleteDevelopment(dependencies: string[]) {
    const commandArguments = `${this.cli.remove} ${
      this.cli.saveDevFlag
    } ${dependencies.join(' ')}`;
    await this.delete(commandArguments);
  }

  public async delete(commandArguments: string) {
    const collect = true;
    await this.runner.run(commandArguments, collect);
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

  public abstract get name(): string;

  public abstract get cli(): PackageManagerCommands;
}
