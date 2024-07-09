import { Command, CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';
import { getCollection, getSchematics, buildSchematicsListAsTable } from '../lib/ui/table';

export class DockerCommand extends AbstractCommand {
  public async load(program: CommanderStatic) {
    program
      .command('docker <services...>')
      .alias('d')
      .description(await this.buildDescription())
      .option(
        '-p, --path [path]',
        'define the path to the docker file',
      )
      .action(async (services: string[],command: Command) => {
        const options: Input[] = [];
        options.push({
          name: 'path',
          value: command.path,
        });
        const inputs: Input[] = services.map(service => ({ name: 'name', value: service }));
        for (const input of inputs) {
          await this.action.handle([input],options); 
        }
      });
  }
  private async buildDescription(): Promise<string> {
    const collection = await getCollection();
    return (
      'Generate a docker service.\n \n' +
      buildSchematicsListAsTable(await getSchematics(collection, 'docker'))
    );
  }
}
