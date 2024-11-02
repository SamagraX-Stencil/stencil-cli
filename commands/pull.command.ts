import { Command, CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';

export class PullCommand extends AbstractCommand{
  public load(program: CommanderStatic) {
    program
      .command('pull <services...>')
      .alias('pu')
      .description('Pull services and modules from a repository or a docker service.')
      .option(
        '--init',
        'initialization of the preview folder',
        false
      )
      .action(async (services: string[],
        command: Command,
      ) => {
        const options: Input[] = [
          { name: 'init', value: command.init || false }
        ];

        const inputs: Input[] = services.map(service => ({ name: 'name', value: service }));
        for (const input of inputs) {
          await this.action.handle([input], options); 
        }
      });
  }
}