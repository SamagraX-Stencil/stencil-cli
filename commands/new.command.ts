import { Command, CommanderStatic } from 'commander';
import { Collection } from '../lib/schematics';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';

export class NewCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('new [name]')
      .alias('n')
      .description('Generate Nest application.')
      .option('--directory [directory]', 'Specify the destination directory')
      .option(
        '-d, --dry-run',
        'Report actions that would be performed without writing out results.',
        false,
      )
      .option('-g, --skip-git', 'Skip git repository initialization.', false)
      .option('-s, --skip-install', 'Skip package installation.', false)
      .option(
        '-p, --package-manager [packageManager]',
        'Specify package manager.',
      )
      .option(
        '-l, --language [language]',
        'Programming language to be used (TypeScript or JavaScript)',
        'TypeScript',
      )
      .option(
        '-c, --collection [collectionName]',
        'Schematics collection to use',
        Collection.NESTJS,
      )
      .option('--strict', 'Enables strict mode in TypeScript.', false)
      .option(
        '--ps, --prisma [prisma]',
        'If you want prisma setup in the project',
      )
      .option(
        '--us, --user-service [userService]',
        'If you user service setup in the project',
      )
      .option(
        '--fs, --fixtures [fixtures]',
        'If you want to have fixtures in the project',
      )
      .option(
        '--mo, --monitoring [monitoring]',
        'If you want to have monitoring setup in the project',
      )
      .option(
        '--ms, --monitoringService [monitoringService]',
        'If you want to have monitoring-service setup in the project',
      )
      .option(
        '--te, --temporal [temporal]',
        'If you want to have temporal setup in the project',
      )
      .option(
        '--lg, --logging [logging]',
        'If you want to have logging setup in the project',
      )
      .option(
        '--fu, --fileUpload [fileUpload]',
        'If you want to have fileUpload setup in the project',
      )
      .action(async (name: string, command: Command) => {
        const options: Input[] = [];
        const availableLanguages = ['js', 'ts', 'javascript', 'typescript'];
        options.push({ name: 'directory', value: command.directory });
        options.push({ name: 'dry-run', value: command.dryRun });
        options.push({ name: 'skip-git', value: command.skipGit });
        options.push({ name: 'skip-install', value: command.skipInstall });
        options.push({ name: 'strict', value: command.strict });
        options.push({
          name: 'packageManager',
          value: command.packageManager,
        });
        options.push({ name: 'collection', value: command.collection });
        options.push({ name: 'prisma', value: command.prisma });
        options.push({ name: 'userService', value: command.userService });
        options.push({ name: 'fixtures', value: command.fixtures });
        options.push({ name: 'monitoring', value: command.monitoring });
        options.push({
          name: 'monitoringService',
          value: command.monitoringService,
        });
        options.push({ name: 'temporal', value: command.temporal });
        options.push({ name: 'logging', value: command.logging });
        options.push({ name: 'fileUpload', value: command.fileUpload });

        if (!!command.language) {
          const lowercasedLanguage = command.language.toLowerCase();
          const langMatch = availableLanguages.includes(lowercasedLanguage);
          if (!langMatch) {
            throw new Error(
              `Invalid language "${command.language}" selected. Available languages are "typescript" or "javascript"`,
            );
          }
          switch (lowercasedLanguage) {
            case 'javascript':
              command.language = 'js';
              break;
            case 'typescript':
              command.language = 'ts';
              break;
            default:
              command.language = lowercasedLanguage;
              break;
          }
        }
        options.push({
          name: 'language',
          value: command.language,
        });

        const inputs: Input[] = [];
        inputs.push({ name: 'name', value: name });

        await this.action.handle(inputs, options);
      });
  }
}
