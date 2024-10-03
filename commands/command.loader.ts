import * as chalk from 'chalk';
import { CommanderStatic } from 'commander';
import {
  AddAction,
  BuildAction,
  GenerateAction,
  InfoAction,
  SpecAction,
  ListAction,
  NewAction,
  StartAction,
  PullAction,
  DockerAction,
} from '../actions';
import { ERROR_PREFIX } from '../lib/ui';
import { AddCommand } from './add.command';
import { BuildCommand } from './build.command';
import { GenerateCommand } from './generate.command';
import { InfoCommand } from './info.command';
import { SpecCommand } from './spec.command';
import { ListCommand } from './list.command';
import { NewCommand } from './new.command';
import { StartCommand } from './start.command';
import { PullCommand } from './pull.command';
import { DockerCommand } from './docker.command';

export class CommandLoader {
  public static async load(program: CommanderStatic): Promise<void> {
    new NewCommand(new NewAction()).load(program);
    new BuildCommand(new BuildAction()).load(program);
    new StartCommand(new StartAction()).load(program);
    new InfoCommand(new InfoAction()).load(program);
    new SpecCommand(new SpecAction()).load(program);
    new ListCommand(new ListAction()).load(program);
    new AddCommand(new AddAction()).load(program);
    new PullCommand(new PullAction()).load(program);
    new DockerCommand(new DockerAction()).load(program);
    await new GenerateCommand(new GenerateAction()).load(program);

    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: CommanderStatic) {
    program.on('command:*', () => {
      console.error(
        `\n${ERROR_PREFIX} Invalid command: ${chalk.red('%s')}`,
        program.args.join(' '),
      );
      console.log(
        `See ${chalk.red('--help')} for a list of available commands.\n`,
      );
      process.exit(1);
    });
  }
}
