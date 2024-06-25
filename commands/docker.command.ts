import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';
import * as chalk from 'chalk';
import * as Table from 'cli-table3';
import { AbstractCollection, CollectionFactory } from '../lib/schematics';
import { Schematic } from '../lib/schematics/nest.collection';
import { loadConfiguration } from '../lib/utils/load-configuration';
export class DockerCommand extends AbstractCommand {
  public async load(program: CommanderStatic) {
    program
      .command('docker <services...>')
      .alias('d')
      .description(await this.buildDescription())
      .action(async (services: string[]) => {
        const inputs: Input[] = services.map(service => ({ name: 'name', value: service }));
        for (const input of inputs) {
          await this.action.handle([input]); 
        }
      });
  }
  private async buildDescription(): Promise<string> {
    const collection = await this.getCollection();
    return (
      'Generate a docker service.\n \n' +
      this.buildSchematicsListAsTable(await this.getSchematics(collection))
    );
  }
  private buildSchematicsListAsTable(schematics: Schematic[]): Promise<string> {
    const leftMargin = '    ';
    const tableConfig = {
      head: ['name', 'alias', 'description'],
      chars: {
        'left': leftMargin.concat('│'),
        'top-left': leftMargin.concat('┌'),
        'bottom-left': leftMargin.concat('└'),
        'mid': '',
        'left-mid': '',
        'mid-mid': '',
        'right-mid': '',
      },
    };
    const table: any = new Table(tableConfig);
    for (const schematic of schematics) {
      table.push([
        chalk.green(schematic.name),
        chalk.cyan(schematic.alias),
        schematic.description,
      ]);
    }
    return table.toString();
  }

  private async getCollection(): Promise<string> {
    const configuration = await loadConfiguration();
    return configuration.collection;
  }

  private async getSchematics(collection: string): Promise<Schematic[]> {
    const abstractCollection: AbstractCollection =
      CollectionFactory.create(collection);
    return abstractCollection.getSchematics('docker');
  }

}
