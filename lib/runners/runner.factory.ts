import * as chalk from 'chalk';
import { NpmRunner } from './npm.runner';
import { Runner } from './runner';
import { SchematicRunner } from './schematic.runner';
import { YarnRunner } from './yarn.runner';
import { PnpmRunner } from './pnpm.runner';
import { NestRunner } from './nest.runner';
import { NpxRunner } from './npx.runner';

export class RunnerFactory {
  public static create(runner: Runner) {
    switch (runner) {
      case Runner.SCHEMATIC:
        return new SchematicRunner();

      case Runner.NPM:
        return new NpmRunner();

      case Runner.YARN:
        return new YarnRunner();

      case Runner.PNPM:
        return new PnpmRunner();

      case Runner.NEST:
        return new NestRunner();

      case Runner.NPX:
        return new NpxRunner();

      default:
        console.info(chalk.yellow(`[WARN] Unsupported runner: ${runner}`));
    }
  }
}
