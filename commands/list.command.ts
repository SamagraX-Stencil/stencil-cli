import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';

export class ListCommand extends AbstractCommand{
  public load(program: CommanderStatic) {
    program
      .command('list')
      .alias('ls')
      .description('List installed modules.')
      .action(async () => {
        await this.action.handle();
      });
  }
}
