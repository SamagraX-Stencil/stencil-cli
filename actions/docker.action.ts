import {
  AbstractPackageManager,
  PackageManagerFactory,
} from '../lib/package-managers';
import { AbstractCollection, Collection, CollectionFactory, SchematicOption,} from '../lib/schematics';
import { AbstractAction } from './abstract.action';
import { Input } from '../commands';

export class DockerAction extends AbstractAction {
  private manager!: AbstractPackageManager;
  public async handle(commandInputs: Input[]) {
    this.manager = await PackageManagerFactory.find();
    
    const collection: AbstractCollection = CollectionFactory.create(
       Collection.NESTJS,
    );
    const schematicOptions: SchematicOption[] = this.mapSchematicOptions(commandInputs);
    schematicOptions.push(
      new SchematicOption('language', 'ts'),
    );
    await collection.execute(commandInputs[0].value as string, schematicOptions,'docker');

  }
  private mapSchematicOptions = (inputs: Input[]): SchematicOption[] => {
  const excludedInputNames = ['schematic', 'spec', 'flat', 'specFileSuffix'];
  const options: SchematicOption[] = [];
  inputs.forEach((input) => {
    if (!excludedInputNames.includes(input.name) && input.value !== undefined) {
      options.push(new SchematicOption(input.name, input.value));
    }
  });
  return options;
};
}