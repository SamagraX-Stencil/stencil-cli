import * as chalk from 'chalk';
import * as fs from 'fs';
import { exec } from 'child_process';
import { platform } from 'os';
import * as inquirer from 'inquirer';
export async function cloneRepo(serviceName: string, repoUrls: { [key: string]: string }): Promise<void> {
  const servicePath = `./services/${serviceName}`;

  if (fs.existsSync(servicePath) && fs.readdirSync(servicePath).length > 0) {
    console.info(chalk.yellow(`The directory ${servicePath} already exists and is not empty. Skipping clone.`));
    return;
  }

  console.info(chalk.green(`Cloning ${serviceName} repository...`));

  const repoUrl = repoUrls[serviceName];
  await runCommand(`git clone ${repoUrl} ./services/${serviceName}`);
}

export async function setupWithDockerfile(serviceName: string): Promise<void> {
  console.info(chalk.green(`Setting up ${serviceName} via Dockerfile...`));

  const servicePath = `./services/${serviceName}`;
  await runCommand(`cd ${servicePath} && docker build -t ${serviceName}-service .`);

  const containerExists = await checkDockerContainerExists(`${serviceName}-container`);
  if (containerExists) {
    console.info(chalk.yellow(`Container ${serviceName}-container already exists.`));
    return;
  }

  await runCommand(`docker run -d -P --name ${serviceName}-container ${serviceName}-service`);
}

export async function setupWithScript(serviceName: string): Promise<void> {
  console.info(chalk.green(`Setting up ${serviceName} via Startup script...`));

  const prompt = inquirer.createPromptModule();
  const { startupScriptPath } = await prompt([
    {
      type: 'input',
      name: 'startupScriptPath',
      message: 'Please provide the path to the startup.sh file:',
      validate: (input: string) => {
        if (!input.endsWith('.sh')) {
          return 'The file must have a .sh extension.';
        }
        if (!fs.existsSync(input)) {
          return `File ${input} does not exist.`;
        }
        return true;
      }
    }
  ]);


  const osPlatform = platform();
  let command = `bash ${startupScriptPath}`; 

  try {
    await runCommand(command);
  } catch (error) {
    console.error(chalk.red(`Error while running startup script: ${error.message}`));
  }
}

export function checkDockerContainerExists(containerName: string): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`docker ps -a -f name=${containerName}`, (error, stdout) => {
      resolve(stdout.includes(containerName));
    });
  });
}

async function runCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = exec(command);

    child.stdout?.on('data', (data) => {
      process.stdout.write(chalk.green(data));
    });

    child.stderr?.on('data', (data) => {
      process.stderr.write(chalk.red(data));
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.info(chalk.green(`Command executed successfully: ${command}`));
        resolve();
      } else {
        console.error(chalk.red(`Command failed with code ${code}: ${command}`));
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

