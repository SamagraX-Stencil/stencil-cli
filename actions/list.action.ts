import * as chalk from 'chalk';
import * as fs from 'fs';
import { join } from 'path';
import { AbstractPackageManager, PackageManagerFactory } from '../lib/package-managers';
import { AbstractAction } from './abstract.action';
import { MESSAGES } from '../lib/ui';

export class ListAction extends AbstractAction {
  private manager!: AbstractPackageManager;
  private specFilePath: string;

  constructor() {
    super();
    this.specFilePath = 'spec.yaml'; // Default spec file path if not found in nest-cli.json
  }

  public async handle() {
    this.manager = await PackageManagerFactory.find();
    await this.loadSpecFilePath();
    await this.loadRegistry();
  }

  private async loadSpecFilePath(): Promise<void> {
    const nestCliPath = join(process.cwd(), 'nest-cli.json');
    try {
      const nestCliContent = await fs.promises.readFile(nestCliPath, 'utf-8');
      const nestCliConfig = JSON.parse(nestCliContent);

      if (nestCliConfig.specFile) {
        this.specFilePath = nestCliConfig.specFile;
      }
    } catch (error) {
      console.error(chalk.yellow(MESSAGES.NEST_CLI_NOT_FOUND));
    }
  }

  private async loadRegistry(): Promise<void> {
    const stencilFilePath = join(process.cwd(), this.specFilePath);
    try {
      const stencilFileContent = await fs.promises.readFile(stencilFilePath, 'utf-8');

      if (stencilFileContent.trim() === '') {
        console.info(chalk.yellow(MESSAGES.NO_SPEC_FOUND));
      } else {
        console.info(chalk.green('Specification file'));
        console.info(stencilFileContent);
      }
    } catch (error) {
      console.error(chalk.red(MESSAGES.ERROR_READING_SPEC, error));
    }
  }
}
