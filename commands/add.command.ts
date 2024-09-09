import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';

export class AddCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('add <subcommand> [controllerPath]')
      .alias('as')
      .description('Add various functionalities to the specified controller.')
      .option('--init', 'Initialize with default options')
      .action(async (subcommand: string, controllerPath: string, options: any) => {
        const inputs: Input[] = [
          { name: 'subcommand', value: subcommand },
          { name: 'controllerPath', value: controllerPath }
        ];

        if (options.init) {
          inputs.push({ name: 'init', value: options.init });
        }

        await this.action.handle(inputs);
      });
  }
}
