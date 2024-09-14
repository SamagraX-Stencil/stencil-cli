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
import { Input } from '../commands';
import { Path } from 'typescript';

interface StencilSpec {
  stencil: string;
  info: {
    properties: {
      'project-name': string;
      'package-manager': string;
    };
  };
  tooling: string[];
  docker?: string[]; 
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
  // constructor(private specFilePath: string) {
  //   super();
  // }

  public async handle(inputs: Input[]) {
    this.manager = await PackageManagerFactory.find();
    await this.loadSpec(inputs);
    spinner.stop();
  }
  private async loadSpec(inputs: Input[]): Promise<void> {
    const specFilePath = inputs.find((option) => option.name === 'filePath');
    if (!specFilePath) {
      console.error(MESSAGES.NO_SPEC_PATH_FOUND);
      return;
    }     
    const specFilePathValue = specFilePath.value as Path;

    if (!specFilePathValue.endsWith('.yaml')) {
      console.error(MESSAGES.INVALID_SPECFILE_EXTENSION);
      return;
    }
    
    const stencilFilePath = join(process.cwd(),specFilePathValue as Path);
    try {
      const stencilFileContent = await fs.promises.readFile(stencilFilePath, 'utf-8');
      console.log(stencilFileContent);
      if (stencilFileContent.trim() === '') {
        console.error(chalk.red(MESSAGES.EMPTY_SPEC_FOUND));
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
        { name: 'temporal', flag: 'te' },
        { name: 'fileUpload', flag: 'fu' }
      ];

      tools.forEach(tool => {
        command += ` --${tool.flag} ${tooling.includes(tool.name) ? 'yes' : 'no'}`;
      });

      command += ` --package-manager ${packageManager}`;
      await this.runCommand(command);

      const dockerServices = spec.docker || [];
      if (dockerServices.length > 0) {
        const projectDir = join(process.cwd(), projectName);
        const dockerCommand = `stencil docker ${dockerServices.join(' ')}`;
        console.info(chalk.green(`Running Docker services: ${dockerServices.join(', ')}`));
        process.chdir(projectDir);
        // await this.runCommand('npm link @samagra-x/schematics @samagra-x/stencil-stencil'); # For testing
        await this.runCommand(dockerCommand);
      }

      console.info('\n');
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.error(`File not found: ${specFilePathValue}`);
        } else {
          console.error(chalk.red(MESSAGES.ERROR_READING_SPEC));
        }      
    }
  }

  private runCommand(command: string): Promise<void> {
    spinner.start();
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
