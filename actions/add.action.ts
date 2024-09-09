import * as chalk from 'chalk';
import { AbstractAction } from './abstract.action';
import { Input } from '../commands/command.input';
import { getControllerFilePath } from './add-utils/file-utils';
import { addSwaggerInitialization } from './add-utils/swagger-initializer';
import { addSwaggerControllers } from './add-utils/swagger-decorator';
import { addSwaggerDto } from './add-utils/swagger-dto';
export class AddAction extends AbstractAction {
  public async handle(inputs: Input[]) {
    const subcommand = inputs.find((input) => input.name === 'subcommand')!.value as string;
    const controllerName = inputs.find((input) => input.name === 'controllerPath')?.value as string;
    const init = inputs.find((input) => input.name === 'init')?.value;

    if (subcommand === 'swagger') {
      if (init) {
        addSwaggerInitialization();
      }

      if (!controllerName) {
        console.error(chalk.red('Controller path is required.'));
        return;
      }

      const controllerPath = getControllerFilePath(controllerName);

      if (!controllerPath) {
        console.error(chalk.red(`Controller file not found in path: ${controllerName}`));
        return;
      }

      addSwaggerControllers(controllerPath);
      addSwaggerDto(controllerName); 

    }
  }
}
