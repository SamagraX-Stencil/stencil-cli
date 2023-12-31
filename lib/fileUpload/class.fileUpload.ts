import * as chalk from 'chalk';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { StencilRunner } from '../runners/stencil.runner';

export class ClassFileUpload {
  public async create(directory: string) {
    const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);

    try {
      await this.createFileUpload(normalizedDirectory);
    } catch (error) {
      console.error('Failed adding fileUpload to app.module.ts');
    }

    console.info('Successfully added fileupload to app.module.ts');
  }

  public async createFileUpload(normalizedDirectory: string): Promise<void> {
    console.info(chalk.grey(MESSAGES.FILE_UPLOAD_START));

    const stencilRunner = new StencilRunner();
    const stencilCmd = 'g service-file-upload';

    try {
      await stencilRunner.run(
        stencilCmd,
        false,
        join(process.cwd(), normalizedDirectory),
      );
    } catch (error) {
      console.error(chalk.red(MESSAGES.FILE_UPLOAD_ERROR));
    }
  }
}
