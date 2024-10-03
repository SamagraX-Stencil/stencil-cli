import * as fs from 'fs';
import * as chalk from 'chalk';

export async function getSpecFilePath(): Promise<string | null> {
  try {
    const nestCliConfig = await fs.promises.readFile('nest-cli.json', 'utf-8');
    const config = JSON.parse(nestCliConfig);
    if (config.specFile) {
      return config.specFile;
    } else {
      return './spec.yaml'; 
    }
  } catch (error) {
    console.error(chalk.red('Error reading nest-cli.json'), error);
    return null;
  }
}
