import { AbstractRunner } from '../runners';
import { AbstractCollection } from './abstract.collection';
import { SchematicOption } from './schematic.option';

export interface Schematic {
  name: string;
  alias: string;
  description: string;
}

export class NestCollection extends AbstractCollection {
  private static schematics: Schematic[] = [
    {
      name: 'application',
      alias: 'application',
      description: 'Generate a new application workspace',
    },
    {
      name: 'angular-app',
      alias: 'ng-app',
      description: '',
    },
    {
      name: 'class',
      alias: 'cl',
      description: 'Generate a new class',
    },
    {
      name: 'configuration',
      alias: 'config',
      description: 'Generate a CLI configuration file',
    },
    {
      name: 'controller',
      alias: 'co',
      description: 'Generate a controller declaration',
    },
    {
      name: 'decorator',
      alias: 'd',
      description: 'Generate a custom decorator',
    },
    {
      name: 'filter',
      alias: 'f',
      description: 'Generate a filter declaration',
    },
    {
      name: 'gateway',
      alias: 'ga',
      description: 'Generate a gateway declaration',
    },
    {
      name: 'guard',
      alias: 'gu',
      description: 'Generate a guard declaration',
    },
    {
      name: 'interceptor',
      alias: 'itc',
      description: 'Generate an interceptor declaration',
    },
    {
      name: 'interface',
      alias: 'itf',
      description: 'Generate an interface',
    },
    {
      name: 'library',
      alias: 'lib',
      description: 'Generate a new library within a monorepo',
    },
    {
      name: 'middleware',
      alias: 'mi',
      description: 'Generate a middleware declaration',
    },
    {
      name: 'module',
      alias: 'mo',
      description: 'Generate a module declaration',
    },
    {
      name: 'pipe',
      alias: 'pi',
      description: 'Generate a pipe declaration',
    },
    {
      name: 'provider',
      alias: 'pr',
      description: 'Generate a provider declaration',
    },
    {
      name: 'resolver',
      alias: 'r',
      description: 'Generate a GraphQL resolver declaration',
    },
    {
      name: 'resource',
      alias: 'res',
      description: 'Generate a new CRUD resource',
    },
    {
      name: 'service',
      alias: 's',
      description: 'Generate a service declaration',
    },
    {
      name: 'sub-app',
      alias: 'app',
      description: 'Generate a new application within a monorepo',
    },
    {
      name: 'service-prisma',
      alias: 'sp',
      description: 'Generate the Prisma service file',
    },
    {
      name: 'service-prisma',
      alias: 'sp',
      description: 'Generate the Prisma service file',
    },
    {
      name: 'service-user',
      alias: 'su',
      description: 'Add the User Service module from the package.',
    },
    {
      name: 'fixtures',
      alias: 'fs',
      description: 'Generate Custom Fixtures Files.',
    },
    {
      name: 'husky',
      alias: 'hs',
      description: 'Generate Custom husky Files.',
    },
    {
      name: 'github',
      alias: 'gh',
      description: 'Generate Custom github Files.',
    },
    {
      name: 'prisma',
      alias: 'ps',
      description: 'Add custom prisma models to the schema.prisma file.',
    },
    {
      name: 'devcontainer',
      alias: 'dc',
      description: 'Generate files in a .devcontainer file.',
    },
    {
      name: 'monitorModule',
      alias: 'mm',
      description: 'add monitor related imports to the app.module.ts file ',
    },
    {
      name: 'monitor',
      alias: 'mf',
      description: 'Generate monitor folder.',
    },
    {
      name: 'service-temporal',
      alias: 'te',
      description: 'If you want to have temporal setup in the project.',
    },
    {
      name: 'logging',
      alias: 'lg',
      description: 'If you want to have logging setup in the project.',
    },
    {
      name: 'service-file-upload',
      alias: 'fu',
      description: 'If you want to have fileUpload setup in the project.',
    },
  ];

  constructor(runner: AbstractRunner) {
    super('@samagra-x/schematics', runner);
  }

  public async execute(name: string, options: SchematicOption[]) {
    const schematic: string = this.validate(name);
    await super.execute(schematic, options);
  }

  public getSchematics(): Schematic[] {
    return NestCollection.schematics.filter(
      (item) => item.name !== 'angular-app',
    );
  }

  private validate(name: string) {
    const schematic = NestCollection.schematics.find(
      (s) => s.name === name || s.alias === name,
    );

    if (schematic === undefined || schematic === null) {
      throw new Error(
        `Invalid schematic "${name}". Please, ensure that "${name}" exists in this collection.`,
      );
    }
    return schematic.name;
  }
}
