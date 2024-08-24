import * as chalk from 'chalk';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import { Answers, Question } from 'inquirer';
import { join } from 'path';
import { Input } from '../commands';
import { defaultGitIgnore } from '../lib/configuration/defaults';
import {
  AbstractPackageManager,
  PackageManager,
  PackageManagerFactory,
} from '../lib/package-managers';
import { generateInput, generateSelect } from '../lib/questions/questions';
import { GitRunner } from '../lib/runners/git.runner';
import {
  AbstractCollection,
  Collection,
  CollectionFactory,
  SchematicOption,
} from '../lib/schematics';
import { EMOJIS, MESSAGES } from '../lib/ui';
import { normalizeToKebabOrSnakeCase } from '../lib/utils/formatting';
import { AbstractAction } from './abstract.action';
import { ClassPrisma } from '../lib/prisma';
import { ClassUserService } from '../lib/service-user';
import { ClassFixtures } from '../lib/fixtures';
import { ClassMonitoring } from '../lib/monitoring';
import { ClassTemporal } from '../lib/temporal';
import { ClassLogging } from '../lib/logging';
import { ClassFileUpload } from '../lib/fileUpload';

export class NewAction extends AbstractAction {
  public async handle(inputs: Input[], options: Input[]) {
    const directoryOption = options.find(
      (option) => option.name === 'directory',
    );
    const dryRunOption = options.find((option) => option.name === 'dry-run');
    const isDryRunEnabled = dryRunOption && dryRunOption.value;

    await askForMissingInformation(inputs, options);
    await generateApplicationFiles(inputs, options).catch(exit);

    const shouldSkipInstall = options.some(
      (option) => option.name === 'skip-install' && option.value === true,
    );

    const shouldSkipGit = options.some(
      (option) => option.name === 'skip-git' && option.value === true,
    );
    const shouldSkipDocker = options.some(
      (option) => option.name === 'skip-docker' && option.value === true,
    );

    const shouldInitializePrima = options.some(
      (option) => option.name === 'prisma' && option.value === 'yes',
    );

    const shouldInitializeUserService = options.some(
      (option) => option.name === 'userService' && option.value === 'yes',
    );

    const shouldInitializeFixtures = options.some(
      (option) => option.name === 'fixtures' && option.value === 'yes',
    );

    const shouldInitializeMonitoring = options.some(
      (option) => option.name === 'monitoring' && option.value === 'yes',
    );

    const shouldInitializeTemporal = options.some(
      (option) => option.name === 'temporal' && option.value === 'yes',
    );


    const shouldInitializeFileUpload = options.some(
      (option) => option.name === 'fileUpload' && option.value === 'yes',
    );

    const projectDirectory = getProjectDirectory(
      getApplicationNameInput(inputs)!,
      directoryOption,
    );

    if (!shouldSkipInstall) {
      await installPackages(
        options,
        isDryRunEnabled as boolean,
        projectDirectory,
        shouldInitializePrima as boolean,
        shouldInitializeUserService as boolean,
        shouldInitializeTemporal as boolean,
      );

      await createPrismaFiles(
        options,
        isDryRunEnabled as boolean,
        projectDirectory,
        shouldInitializePrima as boolean,
      );

      await createUserService(
        isDryRunEnabled as boolean,
        projectDirectory,
        shouldInitializeUserService as boolean,
      );
    }

    await createMonitor(
      isDryRunEnabled as boolean,
      projectDirectory,
      shouldInitializeMonitoring as boolean,
      shouldSkipDocker as boolean,
    );

    await createTemporal(
      isDryRunEnabled as boolean,
      projectDirectory,
      shouldInitializeTemporal as boolean,
      shouldSkipDocker as boolean,
    );


    await createFileUpload(
      isDryRunEnabled as boolean,
      projectDirectory,
      shouldInitializeFileUpload as boolean,
    );

    if (!isDryRunEnabled) {
      if (!shouldSkipGit) {
        await initializeGitRepository(projectDirectory);
        await createGitIgnoreFile(projectDirectory);
        await createRegistry(projectDirectory, shouldInitializePrima,shouldInitializeUserService,shouldInitializeMonitoring,shouldInitializeTemporal,shouldInitializeFileUpload);
        await copyEnvFile(projectDirectory, 'env-example', '.env');
      }

      //pass shouldInitializeFixtures if we make this an option in the future
      await createFixtures(isDryRunEnabled as boolean, projectDirectory, true);

      printCollective();
    }
    process.exit(0);
  }
}

const getApplicationNameInput = (inputs: Input[]) =>
  inputs.find((input) => input.name === 'name');

const getPackageManagerInput = (inputs: Input[]) =>
  inputs.find((options) => options.name === 'packageManager');

const getPrismaInput = (inputs: Input[]) =>
  inputs.find((options) => options.name === 'prisma');

const getUserServiceInput = (inputs: Input[]) =>
  inputs.find((options) => options.name === 'userService');

const getFixturesInput = (inputs: Input[]) =>
  inputs.find((options) => options.name === 'fixtures');

const getMonitoringInput = (inputs: Input[]) =>
  inputs.find((options) => options.name === 'monitoring');


const getTemporalInput = (inputs: Input[]) =>
  inputs.find((options) => options.name === 'temporal');


const getFileUploadInput = (inputs: Input[]) =>
  inputs.find((options) => options.name === 'fileUpload');

const getProjectDirectory = (
  applicationName: Input,
  directoryOption?: Input,
): string => {
  return (
    (directoryOption && (directoryOption.value as string)) ||
    normalizeToKebabOrSnakeCase(applicationName.value as string)
  );
};

const askForMissingInformation = async (inputs: Input[], options: Input[]) => {
  console.info(MESSAGES.PROJECT_INFORMATION_START);
  console.info();

  const prompt: inquirer.PromptModule = inquirer.createPromptModule();

  const nameInput = getApplicationNameInput(inputs);
  if (!nameInput!.value) {
    const message = 'What name would you like to use for the new project?';
    const questions = [generateInput('name', message)('nest-app')];
    const answers: Answers = await prompt(questions as ReadonlyArray<Question>);
    replaceInputMissingInformation(inputs, answers);
  }

  const prismaInput = getPrismaInput(options);
  if (!prismaInput!.value) {
    const answers = await askForPrisma();
    replaceInputMissingInformation(options, answers);
  }

  const userServiceInput = getUserServiceInput(options);
  if (!userServiceInput!.value) {
    const answers = await askForUserService();
    replaceInputMissingInformation(options, answers);
  }

  //UNCOMMENT THE FOLLOWING FUNCTION IF WE WANT TO MAKE THIS AN OPTION IN THE FUTURE

  // const fixturesInput = getFixturesInput(options);
  // if (!fixturesInput!.value) {
  //   const answers = await askForFixtures();
  //   replaceInputMissingInformation(options, answers);
  // }

  const monitoringInput = getMonitoringInput(options);
  if (!monitoringInput!.value) {
    const answers = await askForMonitoring();
    replaceInputMissingInformation(options, answers);
  }


  const temporalInput = getTemporalInput(options);
  if (!temporalInput!.value) {
    const answers = await askForTemporal();
    replaceInputMissingInformation(options, answers);
  }

  const fileUploadInput = getFileUploadInput(options);
  if (!fileUploadInput!.value) {
    const answers = await askForFileUpload();
    replaceInputMissingInformation(options, answers);
  }

  const packageManagerInput = getPackageManagerInput(options);
  if (!packageManagerInput!.value) {
    const answers = await askForPackageManager();
    replaceInputMissingInformation(options, answers);
  }
};

const replaceInputMissingInformation = (
  inputs: Input[],
  answers: Answers,
): Input[] => {
  return inputs.map(
    (input) =>
      (input.value =
        input.value !== undefined ? input.value : answers[input.name]),
  );
};

const generateApplicationFiles = async (args: Input[], options: Input[]) => {
  const collectionName = options.find(
    (option) => option.name === 'collection' && option.value != null,
  )!.value;
  const collection: AbstractCollection = CollectionFactory.create(
    (collectionName as Collection) || Collection.NESTJS,
  );
  const schematicOptions: SchematicOption[] = mapSchematicOptions(
    args.concat(options),
  );
  await collection.execute('application', schematicOptions, 'schematic');
  console.info();
};

const mapSchematicOptions = (options: Input[]): SchematicOption[] => {
  return options.reduce(
    (schematicOptions: SchematicOption[], option: Input) => {
      if (option.name !== 'skip-install') {
        schematicOptions.push(new SchematicOption(option.name, option.value));
      }
      return schematicOptions;
    },
    [],
  );
};

const installPackages = async (
  options: Input[],
  dryRunMode: boolean,
  installDirectory: string,
  shouldInitializePrima: boolean,
  shouldInitialzeUserService: boolean,
  shouldInitializeTemporal: boolean,
) => {
  const inputPackageManager = getPackageManagerInput(options)!.value as string;

  let packageManager: AbstractPackageManager;
  if (dryRunMode) {
    console.info();
    console.info(chalk.green(MESSAGES.DRY_RUN_MODE));
    console.info();
    return;
  }

  try {
    packageManager = PackageManagerFactory.create(inputPackageManager);
    await packageManager.install(
      installDirectory,
      inputPackageManager,
      shouldInitializePrima,
      shouldInitialzeUserService,
      shouldInitializeTemporal,
    );
  } catch (error) {
    if (error && error.message) {
      console.error(chalk.red(error.message));
    }
  }
};

const createPrismaFiles = async (
  options: Input[],
  dryRunMode: boolean,
  createDirectory: string,
  shouldInitializePrima: boolean,
) => {
  if (!shouldInitializePrima) {
    return;
  }
  if (dryRunMode) {
    console.info();
    console.info(chalk.green(MESSAGES.DRY_RUN_MODE));
    console.info();
    return;
  }

  const inputPackageManager = getPackageManagerInput(options)!.value as string;
  const prismaInstance = new ClassPrisma();

  try {
    await prismaInstance.create(createDirectory, inputPackageManager);
  } catch (error) {
    console.error('could not generate the prisma files successfully');
  }
};

const createUserService = async (
  dryRunMode: boolean,
  createDirectory: string,
  shouldInitializeUserService: boolean,
) => {
  if (!shouldInitializeUserService) {
    return;
  }

  if (dryRunMode) {
    console.info();
    console.info(chalk.green(MESSAGES.DRY_RUN_MODE));
    console.info();
    return;
  }

  const userServiceInstance = new ClassUserService();
  try {
    await userServiceInstance.create(createDirectory);
  } catch (error) {
    console.error(
      'could not update the app.module file with user-service file',
    );
  }
};

const createFixtures = async (
  dryRunMode: boolean,
  createDirectory: string,
  shouldInitializeFixtures: boolean,
) => {
  if (!shouldInitializeFixtures) {
    return;
  }

  if (dryRunMode) {
    console.info();
    console.info(chalk.green(MESSAGES.DRY_RUN_MODE));
    console.info();
    return;
  }

  //THIS WILL CREATE THE FILES STEP BY STEP, FIRST IT WILL CREATE THE HUSKY FILES
  //THEN IT WILL CREATE THE .sh AND DOCKER RELATED FILES
  //THEN IT WILL CREATE THE .github FILE
  //THEN IT WILL CREATE THE .devcontainer FILE

  const fixturesInstance = new ClassFixtures();
  try {
    await fixturesInstance.create(createDirectory);
  } catch (error) {
    console.error('could create the necessary files for user fixtures');
  }
};

const createMonitor = async (
  dryRunMode: boolean,
  createDirectory: string,
  shouldInitializeMonitoring: boolean,
  shouldSkipDocker : boolean,
) => {
  if ( !shouldInitializeMonitoring) {
    return;
  }

  if (dryRunMode) {
    console.info();
    console.info(chalk.green(MESSAGES.DRY_RUN_MODE));
    console.info();
    return;
  }

  const MonitoringInstance = new ClassMonitoring();
  try {
    await MonitoringInstance.createFiles(createDirectory,  shouldSkipDocker);
  } catch (error) {
    console.error('could not generate the monitor files');
  }
};

const createTemporal = async (
  dryRunMode: boolean,
  createDirectory: string,
  shouldInitializeTemporal: boolean,
  shouldSkipDocker : boolean,
) => {
  if (!shouldInitializeTemporal) {
    return;
  }

  if (dryRunMode) {
    console.info();
    console.info(chalk.green(MESSAGES.DRY_RUN_MODE));
    console.info();
    return;
  }

  const TemporalInstance = new ClassTemporal();
  try {
    await TemporalInstance.create(createDirectory,shouldSkipDocker);
  } catch (error) {
    console.error('could not create the temporal files');
  }
};


const createFileUpload = async (
  dryRunMode: boolean,
  createDirectory: string,
  shouldInitializeFileUpload: boolean,
) => {
  if (!shouldInitializeFileUpload) {
    return;
  }

  if (dryRunMode) {
    console.info();
    console.info(chalk.green(MESSAGES.DRY_RUN_MODE));
    console.info();
    return;
  }

  const FileUploadInstance = new ClassFileUpload();
  try {
    await FileUploadInstance.create(createDirectory);
  } catch (error) {
    console.error('could not modify the app.module with monitoring');
  }
};

//ASK FOR INPUTS

const askForPackageManager = async (): Promise<Answers> => {
  const questions: Question[] = [
    generateSelect('packageManager')(MESSAGES.PACKAGE_MANAGER_QUESTION)([
      PackageManager.NPM,
      PackageManager.YARN,
      PackageManager.PNPM,
      PackageManager.BUN
    ]),
  ];
  const prompt = inquirer.createPromptModule();
  return await prompt(questions);
};

const askForPrisma = async (): Promise<Answers> => {
  const questions: Question[] = [
    generateSelect('prisma')(MESSAGES.PRISMA_QUESTION)(['yes', 'no']),
  ];
  const prompt = inquirer.createPromptModule();
  return await prompt(questions);
};

const askForUserService = async (): Promise<Answers> => {
  const questions: Question[] = [
    generateSelect('userService')(MESSAGES.USER_SERVICE_QUESTION)([
      'yes',
      'no',
    ]),
  ];
  const prompt = inquirer.createPromptModule();
  return await prompt(questions);
};

const askForFixtures = async (): Promise<Answers> => {
  const questions: Question[] = [
    generateSelect('fixtures')(MESSAGES.FIXTURES_QUESTION)(['yes', 'no']),
  ];
  const prompt = inquirer.createPromptModule();
  return await prompt(questions);
};

const askForMonitoring = async (): Promise<Answers> => {
  const questions: Question[] = [
    generateSelect('monitoring')(MESSAGES.MONITORING_QUESTION)(['yes', 'no']),
  ];
  const prompt = inquirer.createPromptModule();
  return await prompt(questions);
};


const askForTemporal = async (): Promise<Answers> => {
  const questions: Question[] = [
    generateSelect('temporal')(MESSAGES.TEMPORAL_QUESTION)(['yes', 'no']),
  ];
  const prompt = inquirer.createPromptModule();
  return await prompt(questions);
};

const askForFileUpload = async (): Promise<Answers> => {
  const questions: Question[] = [
    generateSelect('fileUpload')(MESSAGES.FILE_UPLOAD_QUESTION)(['yes', 'no']),
  ];
  const prompt = inquirer.createPromptModule();
  return await prompt(questions);
};

const initializeGitRepository = async (dir: string) => {
  const runner = new GitRunner();
  await runner.run('init', true, join(process.cwd(), dir)).catch(() => {
    console.error(chalk.red(MESSAGES.GIT_INITIALIZATION_ERROR));
  });
};

/**
 * Write a file `.gitignore` in the root of the newly created project.
 * `.gitignore` available in `@nestjs/schematics` cannot be published to
 * NPM (needs to be investigated).
 *
 * @param dir Relative path to the project.
 * @param content (optional) Content written in the `.gitignore`.
 *
 * @return Resolves when succeeds, or rejects with any error from `fn.writeFile`.
 */
const createGitIgnoreFile = (dir: string, content?: string) => {
  const fileContent = content || defaultGitIgnore;
  const filePath = join(process.cwd(), dir, '.gitignore');
  // Reason: (https://github.com/SamagraX-Stencil/stencil-cli/issues/2#issuecomment-2021300085)
  // if (fileExists(filePath)) {
  //   return;
  // }
  return fs.promises.writeFile(filePath, fileContent);
};

const copyEnvFile = async (dir: string, envExample: string, envFile: string) => {
  const envExamplePath = join(process.cwd(), dir, envExample);
  const envPath = join(process.cwd(), dir, envFile);

  try {
    const envExampleContent = await fs.promises.readFile(envExamplePath, 'utf-8');
    const envExists = fs.existsSync(envPath);
    let envContent = '';
    if (envExists) {
      envContent = await fs.promises.readFile(envPath, 'utf-8');
    }
    envContent +='\n'+ envExampleContent;

    await fs.promises.writeFile(envPath, envContent);
  } catch (error) {
    console.error(chalk.red(MESSAGES.ENV_UPDATION_ERROR));
  }
};

const createRegistry = async (
  dir: string,
  shouldInitializePrisma: boolean,
  shouldInitializeUserService: boolean,
  shouldInitializeMonitoring: boolean,
  shouldInitializeTemporal: boolean,
  shouldInitializeFileUpload: boolean
): Promise<void> => {
  const filePath = join(process.cwd(), dir, '.stencil');
  
  const setupInfo = [
    shouldInitializePrisma ? 'Prisma Setup' : '',
    shouldInitializeUserService ? 'User Services Setup' : '',
    shouldInitializeMonitoring ? 'Monitoring Setup' : '',
    shouldInitializeTemporal ? 'Temporal Setup' : '',
    shouldInitializeFileUpload ? 'File Upload Setup' : ''
  ].filter(info => info !== '').join('\n');

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    console.log('.stencil file already exists');
  } catch (error) {
    await fs.promises.writeFile(filePath, setupInfo);
    console.log('.stencil file created');
  }
};


const printCollective = () => {
  const dim = print('dim');
  const yellow = print('yellow');
  const emptyLine = print();

  emptyLine();
  yellow(`Thanks for using Stencil 🚀🚀`);
  emptyLine();
  emptyLine();
  emptyLine();
};

const print =
  (color: string | null = null) =>
  (str = '') => {
    const terminalCols = retrieveCols();
    const strLength = str.replace(/\u001b\[[0-9]{2}m/g, '').length;
    const leftPaddingLength = Math.floor((terminalCols - strLength) / 2);
    const leftPadding = ' '.repeat(Math.max(leftPaddingLength, 0));
    if (color) {
      str = (chalk as any)[color](str);
    }
    console.log(leftPadding, str);
  };

export const retrieveCols = () => {
  const defaultCols = 80;
  try {
    const terminalCols = execSync('tput cols', {
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return parseInt(terminalCols.toString(), 10) || defaultCols;
  } catch {
    return defaultCols;
  }
};

const fileExists = (path: string) => {
  try {
    fs.accessSync(path);
    return true;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return false;
    }

    throw err;
  }
};

export const exit = () => process.exit(1);
