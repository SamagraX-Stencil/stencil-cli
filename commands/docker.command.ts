import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';

export class DockerCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('docker <services...>')
      .alias('do')
      .description('Generate docker files for services')
      .action(async (services: string[]) => {
        const inputs: Input[] = services.map(service => ({ name: 'name', value: service }));
        for (const input of inputs) {
          await this.action.handle([input]); 
        }
      });
  }
}
