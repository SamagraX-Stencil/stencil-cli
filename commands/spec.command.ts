import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { SpecAction } from '../actions';

export class SpecCommand extends AbstractCommand{
  public load(program: CommanderStatic) {
    program
      .command('spec [filePath]')
      .alias('sp')
      .description('Generate Project Based on Spec file')
      .action(async (filePath: string) => {
        const action = new SpecAction(filePath);
        await action.handle();
      });
  }
}