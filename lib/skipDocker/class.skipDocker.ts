import * as chalk from 'chalk';
import { join } from 'path';
import { MESSAGES } from '../ui';
import { normalizeToKebabOrSnakeCase } from '../utils/formatting';
import { StencilRunner } from '../runners/stencil.runner';

export class ClassskipDocker {
    public async create(directory: string){
        const normalizedDirectory = normalizeToKebabOrSnakeCase(directory);

        try {
            await this.skipDockerFiles(normalizedDirectory);
        } catch (error) {
            console.error(chalk.red('Failed to skip docker files'));
        }

        console.info(chalk.green('Successfully skipped docker files'));
    }

    private async skipDockerFiles(normalizedDirectory: string): Promise<void> {
        console.info(chalk.grey(MESSAGES.SKIP_DOCKER_START));

        const stencilRunner = new StencilRunner();
        const stencilCmd = 'g skipDocker';

        try {
            await stencilRunner.run(
                stencilCmd,
                false,
                join(process.cwd(), normalizedDirectory),
            );
        } catch (error) {
            console.error(chalk.red(MESSAGES.SKIP_DOCKER_ERROR));
        }
    }
}
