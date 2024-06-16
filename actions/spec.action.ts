import * as chalk from 'chalk';
import * as fs from 'fs';
import { platform, release } from 'os';
import osName = require('os-name');
import * as ora from 'ora';
import { exec } from 'child_process'; 
import * as yaml from 'js-yaml';
import { join } from 'path';
import {
  AbstractPackageManager,
  PackageManagerFactory,
} from '../lib/package-managers';
import { BANNER, MESSAGES } from '../lib/ui';
import { AbstractAction } from './abstract.action';

interface StencilSpec {
  stencil: string;
  info: {
    properties: {
      'project-name': string;
      'package-manager': string;
    };
  };
  tooling: string[];
  endpoints?: string[];
}
const spinner = ora({
  spinner: {
    interval: 120,
    frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
  },
  text: MESSAGES.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS,
});
export class SpecAction extends AbstractAction {
  private manager!: AbstractPackageManager;
  constructor(private specFilePath: string = 'spec.yaml') {
    super();
  }

  public async handle() {
    spinner.start();
    this.manager = await PackageManagerFactory.find();
    await this.loadSpec();
    spinner.stop();
  }
  private async loadSpec(): Promise<void> {
    const stencilFilePath = join(process.cwd(), this.specFilePath);
    try {
      const stencilFileContent = await fs.promises.readFile(stencilFilePath, 'utf-8');
      
      if (stencilFileContent.trim() === '') {
        console.info(chalk.yellow(MESSAGES.NO_SPEC_FOUND));
        return;
      } 

      let projectName: string = '';
      let packageManager: string = '';

      const spec = yaml.load(stencilFileContent) as StencilSpec;
      if (spec.info && spec.info.properties ) {
        if( spec.info.properties['project-name'] && typeof spec.info.properties['project-name'] === 'string'){
          projectName = spec.info.properties['project-name'];
        }
        if( spec.info.properties['package-manager'] && typeof spec.info.properties['package-manager'] === 'string'){
          packageManager = spec.info.properties['package-manager'];
        }
      } else {
        console.error(chalk.red(MESSAGES.ERROR_READING_SPEC));
      }
      const tooling = spec.tooling || [];

      let command = `stencil new ${projectName}`;
      
      const tools = [
        { name: 'prisma', flag: 'ps' },
        { name: 'userService', flag: 'us' },
        { name: 'monitoring', flag: 'mo' },
        { name: 'monitoringService', flag: 'ms' },
        { name: 'temporal', flag: 'te' },
        { name: 'logging', flag: 'lg' },
        { name: 'fileUpload', flag: 'fu' }
      ];

      tools.forEach(tool => {
        command += ` --${tool.flag} ${tooling.includes(tool.name) ? 'yes' : 'no'}`;
      });

      command += ` --package-manager ${packageManager}`;
      await this.runCommand(command);
      console.info('\n');
      } catch (error) {
      console.error(chalk.red(MESSAGES.ERROR_READING_SPEC), error);
    }
  }

  private runCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        console.info('\n');
        if (error) {
          console.error(chalk.red(`Error executing command: ${command}`));
          console.error(chalk.red(stderr));
          reject(error);
        } else {
          console.log(stdout);
          resolve();
        }
      });
    });
  }
  
}
