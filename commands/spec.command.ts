import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { MESSAGES } from '../lib/ui';
import { Input } from './command.input';

export class SpecCommand extends AbstractCommand{
  public load(program: CommanderStatic) {
    program
      .command('spec [filePath]')
      .alias('sp')
      .description('Generate Project Based on Spec file')
      .action(async (filePath: string) => {
        const inputs: Input[] = [];
        inputs.push({ name: 'filePath', value: filePath });
        if(filePath==undefined){
          console.error(MESSAGES.NO_SPEC_PATH_FOUND);
          return;
        }
        this.action.handle(inputs);
      });
  }
}