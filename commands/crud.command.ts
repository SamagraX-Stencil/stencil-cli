import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';

export class CrudCommand extends AbstractCommand{
  public load(program: CommanderStatic) {
    program
      .command('crud')
      .alias('cr')
      .description('Generate crud api.')
      .action(async () => {
        await this.action.handle();
      });
  }
}
