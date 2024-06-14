import * as chalk from 'chalk';
import { EMOJIS } from './emojis';

export const MESSAGES = {
  PROJECT_SELECTION_QUESTION: 'Which project would you like to generate to?',
  LIBRARY_PROJECT_SELECTION_QUESTION:
    'Which project would you like to add the library to?',
  DRY_RUN_MODE: 'Command has been executed in dry run mode, nothing changed!',
  PROJECT_INFORMATION_START: `${EMOJIS.ZAP}  We will scaffold your app in a few seconds..`,
  RUNNER_EXECUTION_ERROR: (command: string) =>
    `\nFailed to execute command: ${command}`,
  PACKAGE_MANAGER_QUESTION: `Which package manager would you ${EMOJIS.HEART}  to use?`,
  FIXTURES_QUESTION: 'Do you want toi setup fixtures in your project? ',
  FIXTURES_FILES_INITIALIZATION_START:
    'Starting the initialisation of the fixtures files',
  FIXTURES_FILES_INITIALIZATION_ERROR: 'Could not generate the fixtures files',
  DEVCONATINER_FILES_INITIALIZATION_START:
    'Starting the initialisation of the devcontainer files',
  DEVCONATINER_FILES_INITIALIZATION_ERROR:
    'Could not generate the devcontainer files',
  GITHUB_FILES_INITIALIZATION_START:
    'Starting the initialisation of the github files',
  GITHUB_FILES_INITIALIZATION_ERROR: 'Could not generate the github files',
  HUSKY_INITIALISATION_START: 'Starting initialisation of husky base files',
  HUSKY_INITIALISATION_ERROR:
    'Error generating the base husky files(husky was not installed properly)',
  USER_SERVICE_QUESTION: 'Do you want to have User Service Setup ',
  USER_SERVICE_INSTALLATION_ERROR: 'Failed to install the user service package',
  USER_SERVICE_FILE_INITIALIZATION_START:
    'Starting initialisation of the user service',
  USER_SERVICE_FILE_INITIALIZATION_ERROR:
    'Could not initialise the user service properly',
  PRISMA_QUESTION: 'Do you want to have prisma setup?',
  PRISMA_INSTALLATION_FAILURE: `Prisma and prisma client could not be succesfully installed`,
  PRISMA_SCHEMA_INITIALIZATION: `Starting the prisma schema initialization`,
  PRISMA_SCHEMA_INITIALIZATION_ERROR: `Failed to run the npx prisma init command`,
  PRISMA_SERVICE_INITIALIZATION: `Generating the prisma service files`,
  PRISMA_SCHEMA_UPDATE: 'starting to add model',
  PRISMA_SCHEMA_UPDATE_ERROR: 'could not add models',
  PRISMA_GENERATE_START: 'starting to run the generate command',
  PRISMA_GENERATE_ERROR: 'failed to run the generate command',
  PRISMA_SERVICE_INITIALIZATION_ERROR: `Failed to generate the prisma service files`,
  MONITORING_QUESTION: 'Do you want to add monitoring to this project ?',
  MONITORING_INSTALL_START: 'Starting to add monitoring to app.module.ts',
  MONITORING_INSTALL_ERROR: "Couldn't add monitoring to app.module.ts",
  MONITOR_GENERATION_START: 'Starting the generation of the monitor folder',
  MONITOR_GENERATION_ERROR: 'Could not generate the monitor folder',
  TEMPORAL_QUESTION: 'Do you want to setup temporal in this project ?',
  TEMPORAL_START: 'Starting to setup temporal',
  TEMPORAL_ERROR: "Couldn't setup temporal",
  LOGGING_QUESTION: 'Do you want to setup logging in this project ?',
  LOGGING_START: 'Starting to create the logging files in services folder',
  LOGGING_ERROR: "Couldn't create the logging files in services folder",
  ENV_UPDATION_ERROR: "Couldn't update the .env file",
  FILE_UPLOAD_QUESTION: 'Do you want to setup file upload in this project ?',
  FILE_UPLOAD_START: 'Starting to add file upload to app.module.ts',
  FILE_UPLOAD_ERROR: "Couldn't add file upload to app.module.ts",
  PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS: `Installation in progress... ${EMOJIS.COFFEE}`,
  PACKAGE_MANAGER_UPDATE_IN_PROGRESS: `Installation in progress... ${EMOJIS.COFFEE}`,
  PACKAGE_MANAGER_UPGRADE_IN_PROGRESS: `Installation in progress... ${EMOJIS.COFFEE}`,
  PACKAGE_MANAGER_PRODUCTION_INSTALLATION_IN_PROGRESS: `Package installation in progress... ${EMOJIS.COFFEE}`,
  GIT_INITIALIZATION_ERROR: 'Git repository has not been initialized',
  PACKAGE_MANAGER_INSTALLATION_SUCCEED: (name: string) =>
    name !== '.'
      ? `${EMOJIS.ROCKET}  Successfully created project ${chalk.green(name)}`
      : `${EMOJIS.ROCKET}  Successfully created a new project`,
  GET_STARTED_INFORMATION: `${EMOJIS.POINT_RIGHT}  Get started with the following commands:`,
  CHANGE_DIR_COMMAND: (name: string) => `$ cd ${name}`,
  START_COMMAND: (name: string) => `$ ${name} run start`,
  PACKAGE_MANAGER_INSTALLATION_FAILED: (commandToRunManually: string) =>
    `${EMOJIS.SCREAM}  Packages installation failed!\nIn case you don't see any errors above, consider manually running the failed command ${commandToRunManually} to see more details on why it errored out.`,
  // tslint:disable-next-line:max-line-length
  NEST_INFORMATION_PACKAGE_MANAGER_FAILED: `${EMOJIS.SMIRK}  cannot read your project package.json file, are you inside your project directory?`,
  LIBRARY_INSTALLATION_FAILED_BAD_PACKAGE: (name: string) =>
    `Unable to install library ${name} because package did not install. Please check package name.`,
  LIBRARY_INSTALLATION_FAILED_NO_LIBRARY: 'No library found.',
  LIBRARY_INSTALLATION_STARTS: 'Starting library setup...',
};
