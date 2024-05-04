import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';

export class SpecCommand extends AbstractCommand{
  public load(program: CommanderStatic) {
    program
      .command('spec')
      .alias('sp')
      .description('Generate Project Based on Spec file')
      .action(async () => {
        await this.action.handle();
      });
  }
}