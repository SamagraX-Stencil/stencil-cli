import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';

export class AddCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('add <subcommand> [modelName]')
      .alias('as')
      .description('Add various swagger methods to the specified model.')
      .option('--init', 'Initialize with default options')
      .action(async (subcommand: string, modelPath: string, options: any) => {
        const inputs: Input[] = [
          { name: 'subcommand', value: subcommand },
          { name: 'modelPath', value: modelPath }
        ];

        if (options.init) {
          inputs.push({ name: 'init', value: options.init });
        }

        await this.action.handle(inputs);
      });
  }
}
