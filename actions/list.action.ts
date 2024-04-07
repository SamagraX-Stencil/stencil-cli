import * as chalk from 'chalk';
import * as fs from 'fs';
import { platform, release } from 'os';
import osName = require('os-name');
import { join } from 'path';
import {
  AbstractPackageManager,
  PackageManagerFactory,
} from '../lib/package-managers';
import { BANNER, MESSAGES } from '../lib/ui';
import { AbstractAction } from './abstract.action';


export class ListAction extends AbstractAction {
  private manager!: AbstractPackageManager;

  public async handle() {
    this.manager = await PackageManagerFactory.find();
    await this.loadRegistry();
  }
  private async loadRegistry(): Promise<void>  {
        const stencilFilePath = join(process.cwd(), '.stencil');
        try {
            const stencilFileContent = await fs.promises.readFile(stencilFilePath, 'utf-8');

            if (stencilFileContent.trim() === '') {
                console.log(chalk.yellow('No modules found'));
              } else {
                console.log(chalk.green('Installed Modules:'));
                console.log(stencilFileContent);
              }
        }catch (error) {
            console.error(chalk.red('Error reading .stencil file'));
        }
        
    }


}
