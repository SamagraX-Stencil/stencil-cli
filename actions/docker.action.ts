import {
  AbstractPackageManager,
  PackageManagerFactory,
} from '../lib/package-managers';
import { AbstractCollection, Collection, CollectionFactory, SchematicOption,} from '../lib/schematics';
import { AbstractAction } from './abstract.action';
import { Input } from '../commands';
import * as chalk from 'chalk';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { getSpecFilePath } from '../lib/utils/specFilePath';

export class DockerAction extends AbstractAction {
  private manager!: AbstractPackageManager;
  public async handle(commandInputs: Input[],options: Input[]) {
    this.manager = await PackageManagerFactory.find();
    
    const serviceName = commandInputs[0].value as string;

    const specFilePath = await getSpecFilePath();
    
    if (specFilePath) {
      await this.updateSpecFile(specFilePath, serviceName);
    }

    const collection: AbstractCollection = CollectionFactory.create(
       Collection.NESTJS,
    );
    const schematicOptions: SchematicOption[] = this.mapSchematicOptions(commandInputs);
    schematicOptions.push(
      new SchematicOption('language', 'ts'),
    );
    const path = options.find((option) => option.name === 'path')!.value as string;
    schematicOptions.push(new SchematicOption('path', path));
    try {
    await collection.execute(commandInputs[0].value as string, schematicOptions,'docker');
    }catch(error){
      if (error && error.message) {
      console.error(chalk.red(error.message));
      }
    }
  }

  private async updateSpecFile(specFilePath: string, serviceName: string): Promise<boolean> {
    try {
      const specFileFullPath = join(process.cwd(), specFilePath);
      const specFileContent = await fs.promises.readFile(specFileFullPath, 'utf-8');
      const spec = yaml.load(specFileContent) as any;
      
      if (!spec.docker) {
        spec.docker = [];
      }

      let updated = false;
      if (!spec.docker.includes(serviceName)) {
        spec.docker.push(serviceName);
        updated = true;
      }

      if (updated) {
        const updatedYaml = yaml.dump(spec);
        await fs.promises.writeFile(specFileFullPath, updatedYaml, 'utf-8');
      }
      
      return updated;
    } catch (error) {
      console.error(chalk.red('Error reading or updating spec.yaml'), error);
      return false;
    }
  }

  private mapSchematicOptions = (inputs: Input[]): SchematicOption[] => {
  const excludedInputNames = ['path','schematic', 'spec', 'flat', 'specFileSuffix'];
  const options: SchematicOption[] = [];
  inputs.forEach((input) => {
    if (!excludedInputNames.includes(input.name) && input.value !== undefined) {
      options.push(new SchematicOption(input.name, input.value));
    }
  });
  return options;
};
}