// table.utils.ts
import * as chalk from 'chalk';
import * as Table from 'cli-table3';
import { Schematic,Docker} from '../schematics/nest.collection';
import { loadConfiguration } from '../utils/load-configuration';
import { AbstractCollection, CollectionFactory } from '../schematics';

export async function getCollection(): Promise<string> {
  const configuration = await loadConfiguration();
  return configuration.collection;
}

export async function getSchematics(collection: string, type: 'schematic' | 'docker'): Promise<Schematic[]> {
  const abstractCollection: AbstractCollection = CollectionFactory.create(collection);
  return abstractCollection.getSchematics(type);
}

export function buildSchematicsListAsTable(schematics: Schematic[]): string {
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
