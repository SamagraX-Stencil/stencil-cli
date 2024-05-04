import * as chalk from 'chalk';
import * as fs from 'fs';
import { platform, release } from 'os';
import osName = require('os-name');
import { exec } from 'child_process'; 
import * as yaml from 'js-yaml';
import { join } from 'path';
import {
  AbstractPackageManager,
  PackageManagerFactory,
} from '../lib/package-managers';
import { BANNER, MESSAGES } from '../lib/ui';
import { AbstractAction } from './abstract.action';


export class SpecAction extends AbstractAction {
  private manager!: AbstractPackageManager;

  public async handle() {
    this.manager = await PackageManagerFactory.find();
    await this.loadSpec();
  }
  private async loadSpec(): Promise<void> {
    const stencilFilePath = join('spec.yaml');
    try {
        const stencilFileContent = await fs.promises.readFile(stencilFilePath, 'utf-8');

        if (stencilFileContent.trim() === '') {
            console.log(chalk.yellow('No spec file found'));
        } else {
            console.log(chalk.green('Specification file'));
            console.log(stencilFileContent);
            const spec = yaml.load(stencilFileContent) as {
              projectName: string;
              packageManager: string;
              prismaSetup: boolean;
              userServiceSetup: boolean;
              monitoringSetup: boolean;
              monitoringServicesSetup: boolean;
              temporalSetup: boolean;
              loggingSetup: boolean;
              fileUploadSetup: boolean;
          };          

          let command = `stencil new ${spec.projectName}`;
          command += ` --ps ${spec.prismaSetup ? 'yes' : 'no'}`;
          command += ` --us ${spec.userServiceSetup ? 'yes' : 'no'}`;
          command += ` --mo ${spec.monitoringSetup ? 'yes' : 'no'}`;
          command += ` --ms ${spec.monitoringServicesSetup ? 'yes' : 'no'}`;
          command += ` --te ${spec.temporalSetup ? 'yes' : 'no'}`;
          command += ` --lg ${spec.loggingSetup ? 'yes' : 'no'}`;
          command += ` --fu ${spec.fileUploadSetup ? 'yes' : 'no'}`;          
            command += ` --package-manager ${spec.packageManager}`;
            console.log(command);
            await this.runCommand(command);
        }

    } catch (error) {
        console.error(chalk.red('Error reading spec file'));
    }
}


    private runCommand(command: string): Promise<void> {
      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(chalk.red(`Error executing command: ${command}`));
            console.error(chalk.red(stderr));
            reject(error);
          } else {
            console.log(chalk.green(`Command executed successfully: ${command}`));
            console.log(stdout);
            resolve();
          }
        });
      });
    }
}
