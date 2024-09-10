import * as chalk from 'chalk';
import { AbstractAction } from './abstract.action';
import { Input } from '../commands/command.input';
import { getControllerFilePath, getDtoFilePath } from './add-utils/file-utils';
import { addSwaggerInitialization } from './add-utils/swagger-initializer';
import { addSwaggerControllers } from './add-utils/swagger-decorator';
import { addSwaggerDto } from './add-utils/swagger-dto';
export class AddAction extends AbstractAction {
  public async handle(inputs: Input[]) {
    const subcommand = inputs.find((input) => input.name === 'subcommand')!.value as string;
    const modelPath  = inputs.find((input) => input.name === 'modelPath')?.value as string;
    const init = inputs.find((input) => input.name === 'init')?.value;

    if (subcommand === 'swagger') {
      if (init) {
        addSwaggerInitialization();
      }

      if (!modelPath) {
        console.error(chalk.red('Model path is required.'));
        return;
      }

      const controllerPath = getControllerFilePath(modelPath);

      if (!controllerPath) {
        console.error(chalk.red(`Controller file not found in path: ${modelPath}`));
        return;
      }
      const dtoFilePath = getDtoFilePath(modelPath);

      if (!dtoFilePath) {
        console.error(chalk.red(`DTO file not found for model: ${modelPath}`));
        return;
      }
    

      addSwaggerControllers(controllerPath);
      addSwaggerDto(dtoFilePath); 

    }
  }
}
