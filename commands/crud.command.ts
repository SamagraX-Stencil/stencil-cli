import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';

export class CrudCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('crud [inputs...]')
      .alias('cr')
      .description('Generate CRUD API for specified models.')
      .action(async (inputArgs: string[] = []) => {
        const inputs: Input[] = inputArgs.map(arg => ({ name: arg, value: arg }));
        await this.action.handle(inputs);
      });
  }
}
