import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';

export class PullCommand extends AbstractCommand{
  public load(program: CommanderStatic) {
    program
      .command('pull <services...>')
      .alias('pu')
      .description('Pull services and modules from a repository or a docker service.')
      .action(async (services: string[]) => {
        const inputs: Input[] = services.map(service => ({ name: 'name', value: service }));
        for (const input of inputs) {
          await this.action.handle([input]); 
        }
      });
  }
}