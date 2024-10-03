import { AbstractRunner } from '../../../lib/runners';
import { NestCollection } from '../../../lib/schematics/nest.collection';

describe('Nest Collection', () => {
  const schematics = [
    'application',
    'class',
    'configuration',
    'controller',
    'decorator',
    'library',
    'filter',
    'gateway',
    'guard',
    'interceptor',
    'interface',
    'middleware',
    'module',
    'pipe',
    'provider',
    'resolver',
    'service',
    'sub-app',
    'resource',
    'service-prisma',
    'service-user',
    'fixtures',
    'husky',
    'github',
    'prisma',
    'devcontainer',
    'monitoring',
    'service-temporal',
    'service-file-upload',
  ];

  const aliases = [
    { name: 'application', alias: 'application' },
    { name: 'class', alias: 'cl' },
    { name: 'configuration', alias: 'config' },
    { name: 'controller', alias: 'co' },
    { name: 'decorator', alias: 'd' },
    { name: 'library', alias: 'lib' },
    { name: 'filter', alias: 'f' },
    { name: 'gateway', alias: 'ga' },
    { name: 'guard', alias: 'gu' },
    { name: 'interceptor', alias: 'itc' },
    { name: 'interface', alias: 'itf' },
    { name: 'middleware', alias: 'mi' },
    { name: 'module', alias: 'mo' },
    { name: 'pipe', alias: 'pi' },
    { name: 'provider', alias: 'pr' },
    { name: 'resolver', alias: 'r' },
    { name: 'service', alias: 's' },
    { name: 'sub-app', alias: 'app' },
    { name: 'resource', alias: 'res' },
  ];

  const dockerSchematics = [
    'logging',
    'monitoringService',
    'temporal',
    'postgres',
    'hasura',
  ];

  const dockerAliases = [
    { name: 'logging', alias: 'lg' },
    { name: 'monitoringService', alias: 'ms' },
    { name: 'temporal', alias: 'tp' },
    { name: 'postgres', alias: 'pg' },
    { name: 'hasura', alias: 'hs' },
  ];

  schematics.forEach((schematic) => {
    it(`should call runner with ${schematic} schematic name`, async () => {
      const mock = jest.fn();
      mock.mockImplementation(() => ({
        logger: {},
        run: jest.fn().mockImplementation(() => Promise.resolve()),
      }));
      const mockedRunner = mock();
      const collection = new NestCollection(mockedRunner as AbstractRunner);
      await collection.execute(schematic, [], 'schematic');
      expect(mockedRunner.run).toHaveBeenCalledWith(
        `@samagra-x/schematics:${schematic}`,
      );
    });
  });

  aliases.forEach((schematic) => {
    it(`should call runner with schematic ${schematic.name} name when use ${schematic.alias} alias`, async () => {
      const mock = jest.fn();
      mock.mockImplementation(() => ({
        logger: {},
        run: jest.fn().mockImplementation(() => Promise.resolve()),
      }));
      const mockedRunner = mock();
      const collection = new NestCollection(mockedRunner as AbstractRunner);
      await collection.execute(schematic.alias, [], 'schematic');
      expect(mockedRunner.run).toHaveBeenCalledWith(
        `@samagra-x/schematics:${schematic.name}`,
      );
    });
  });

  dockerSchematics.forEach((schematic) => {
    it(`should call runner with ${schematic} docker schematic name`, async () => {
      const mock = jest.fn();
      mock.mockImplementation(() => ({
        logger: {},
        run: jest.fn().mockImplementation(() => Promise.resolve()),
      }));
      const mockedRunner = mock();
      const collection = new NestCollection(mockedRunner as AbstractRunner);
      await collection.execute(schematic, [], 'docker');
      expect(mockedRunner.run).toHaveBeenCalledWith(
        `@samagra-x/schematics:${schematic}`,
      );
    });
  });

  dockerAliases.forEach((schematic) => {
    it(`should call runner with docker schematic ${schematic.name} name when use ${schematic.alias} alias`, async () => {
      const mock = jest.fn();
      mock.mockImplementation(() => ({
        logger: {},
        run: jest.fn().mockImplementation(() => Promise.resolve()),
      }));
      const mockedRunner = mock();
      const collection = new NestCollection(mockedRunner as AbstractRunner);
      await collection.execute(schematic.alias, [], 'docker');
      expect(mockedRunner.run).toHaveBeenCalledWith(
        `@samagra-x/schematics:${schematic.name}`,
      );
    });
  });

  it('should throw an error when schematic name is not in nest collection', async () => {
    const mock = jest.fn();
    mock.mockImplementation(() => ({
      logger: {},
      run: jest.fn().mockImplementation(() => Promise.resolve()),
    }));
    const mockedRunner = mock();
    const collection = new NestCollection(mockedRunner as AbstractRunner);
    try {
      await collection.execute('invalid-schematic', [], 'schematic');
    } catch (error) {
      expect(error.message).toContain(
        'Invalid schematic "invalid-schematic". Please, ensure that "invalid-schematic" exists in this collection.',
      );
    }
  });

  it('should throw an error when docker name is not in nest collection', async () => {
    const mock = jest.fn();
    mock.mockImplementation(() => ({
      logger: {},
      run: jest.fn().mockImplementation(() => Promise.resolve()),
    }));
    const mockedRunner = mock();
    const collection = new NestCollection(mockedRunner as AbstractRunner);
    try {
      await collection.execute('invalid-docker', [], 'docker');
    } catch (error) {
      expect(error.message).toContain(
        'Invalid schematic "invalid-docker". Please, ensure that "invalid-docker" exists in this collection.',
      );
    }
  });
});
