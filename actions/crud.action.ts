import * as chalk from 'chalk';
import * as fs from 'fs';
import { getDMMF } from '@prisma/internals';
import {
  AbstractPackageManager,
  PackageManagerFactory,
} from '../lib/package-managers';
import { AbstractAction } from './abstract.action';
import { controllerTemplate } from '../lib/templates/controller-template';
import { serviceTemplate } from '../lib/templates/service-template';
import { dtoTemplate } from '../lib/templates/dto-template';
import { Input } from '../commands/command.input';

export class CrudAction extends AbstractAction {
  private manager!: AbstractPackageManager;

  public async handle(inputs: Input[]) {
    this.manager = await PackageManagerFactory.find();
    await this.generateCrud(inputs);
  }

  private async generateCrud(inputs: Input[]): Promise<void> {
    try {
      console.info(chalk.green('Generating CRUD API'));

      const dmmf = await this.generateDMMFJSON();
      if (dmmf) {
        const existingModels = dmmf.datamodel.models.map((model: any) => model.name);
        const inputModelNames = inputs.map(input => input.name);
        const invalidInputs = inputModelNames.filter(name => name !== '*' && !existingModels.includes(name));

        if (invalidInputs.length > 0) {
          console.error(chalk.red('The following models do not exist:'), invalidInputs.join(', '));
          return;
        }

        const modelsToGenerate = inputModelNames.includes('*') ? existingModels : inputModelNames;

        this.generateTypes(dmmf, modelsToGenerate);
        this.createAPIs(dmmf, modelsToGenerate);
        this.updateAppModule(dmmf, modelsToGenerate);
      }
    } catch (error) {
      console.error(chalk.red('Error generating CRUD API'), error);
    }
  }

  private async generateDMMFJSON(): Promise<any> {
    try {
      const datamodel = fs.readFileSync('./schema.prisma', 'utf-8');
      const dmmf = await getDMMF({ datamodel });
      fs.writeFileSync('./dmmf.json', JSON.stringify(dmmf, null, 2));
      return dmmf;
    } catch (error) {
      console.error(chalk.red('Error generating DMMF JSON'), error);
      return null;
    }
  }

  private generateTypes(dmmf: any, modelNames: string[]): void {
    try {
      const models = dmmf.datamodel.models.filter((model: any) =>
        modelNames.includes(model.name)
      );

      models.forEach((model: any) => {
        const modelDir = `./src/${model.name.toLowerCase()}`;
        const dtoDir = `${modelDir}/dto`;

        if (!fs.existsSync(modelDir)) {
          fs.mkdirSync(modelDir, { recursive: true });
        }
        if (!fs.existsSync(dtoDir)) {
          fs.mkdirSync(dtoDir, { recursive: true });
        }

        const interfaceContent = this.interfaceTemplate(model);
        fs.writeFileSync(`${modelDir}/${model.name.toLowerCase()}.interface.ts`, interfaceContent);

        const dtoContent = dtoTemplate(model);
        fs.writeFileSync(`${dtoDir}/${model.name.toLowerCase()}.dto.ts`, dtoContent);
      });

      console.info(chalk.green('Types generated successfully'));
    } catch (error) {
      console.error(chalk.red('Error generating types'), error);
    }
  }

  private interfaceTemplate(model: any): string {
    const fields = model.fields.map((field: any) => {
      return `${field.name}${field.isRequired ? '' : '?'}: ${this.getType(field)};`;
    }).join('\n  ');

    return `export interface ${model.name} {\n  ${fields}\n}`;
  }

  private getType(field: any): string {
    switch (field.type) {
      case 'Int': return 'number';
      case 'String': return 'string';
      case 'Boolean': return 'boolean';
      case 'DateTime': return 'Date';
      case 'Json': return 'any';
      default: return 'any';
    }
  }

  private createAPIs(dmmf: any, modelNames: string[]): void {
    try {
      const models = dmmf.datamodel.models.filter((model: any) =>
        modelNames.includes(model.name)
      );
      models.forEach((model: any) => {
        this.createModelAPI(model);
      });
      console.info(chalk.green('APIs created successfully'));
    } catch (error) {
      console.error(chalk.red('Error creating APIs'), error);
    }
  }

  private createModelAPI(model: any): void {
    const modelDir = `./src/${model.name.toLowerCase()}`;

    const controllerPath = `${modelDir}/${model.name.toLowerCase()}.controller.ts`;
    const servicePath = `${modelDir}/${model.name.toLowerCase()}.service.ts`;

    if (!fs.existsSync(controllerPath)) {
      const controllerContent = controllerTemplate(model);
      fs.writeFileSync(controllerPath, controllerContent);
      console.info(chalk.green(`${model.name.toLowerCase()}.controller.ts created successfully`));
    } else {
      console.info(chalk.yellow(`${model.name.toLowerCase()}.controller.ts already exists`));
    }

    if (!fs.existsSync(servicePath)) {
      const serviceContent = serviceTemplate(model);
      fs.writeFileSync(servicePath, serviceContent);
      console.info(chalk.green(`${model.name.toLowerCase()}.service.ts created successfully`));
    } else {
      console.info(chalk.yellow(`${model.name.toLowerCase()}.service.ts already exists`));
    }
  }

  private updateAppModule(dmmf: any, modelNames: string[]): void {
    try {
      const models = dmmf.datamodel.models.filter((model: any) =>
        modelNames.includes(model.name)
      );
      const newImports = models.map((model: any) => {
        const controllerImport = `import { ${model.name}Controller } from './${model.name.toLowerCase()}/${model.name.toLowerCase()}.controller';`;
        const serviceImport = `import { ${model.name}Service } from './${model.name.toLowerCase()}/${model.name.toLowerCase()}.service';`;

        return `${serviceImport}\n${controllerImport}`;
      }).join('\n');

      const newControllers = models.map((model: any) => `${model.name}Controller`);
      const newProviders = models.map((model: any) => `${model.name}Service`);

      const appModulePath = './src/app.module.ts';
      let appModuleContent = fs.readFileSync(appModulePath, 'utf-8');

      // Avoid duplicate imports
      const importRegex = /import {[^}]*} from '[@a-zA-Z0-9\/]*';/g;
      const existingImports: string[] = appModuleContent.match(importRegex) || [];
      const uniqueNewImports = newImports.split('\n').filter((importLine: string) => !existingImports.some(existingImport => existingImport === importLine)).join('\n');

      if (uniqueNewImports) {
        appModuleContent = appModuleContent.replace(
          /(import {[^}]*} from '[@a-zA-Z0-9\/]*';\n*)+/,
          `$&${uniqueNewImports}\n`
        );
      }

      // Update controllers and providers arrays
      const controllersRegex = /controllers: \[([^\]]*)\]/s;
      const providersRegex = /providers: \[([^\]]*)\]/s;

      const controllersMatch = appModuleContent.match(controllersRegex);
      const providersMatch = appModuleContent.match(providersRegex);

      const currentControllers = controllersMatch ? controllersMatch[1].split(',').map(controller => controller.trim()).filter(Boolean) : [];
      const currentProviders = providersMatch ? providersMatch[1].split(',').map(provider => provider.trim()).filter(Boolean) : [];

      const updatedControllers = Array.from(new Set([...currentControllers, ...newControllers])).join(', ');
      const updatedProviders = Array.from(new Set([...currentProviders, ...newProviders])).join(', ');

      appModuleContent = appModuleContent.replace(
        controllersRegex,
        `controllers: [${updatedControllers}]`
      );

      appModuleContent = appModuleContent.replace(
        providersRegex,
        `providers: [${updatedProviders}]`
      );

      fs.writeFileSync(appModulePath, appModuleContent);
      console.info(chalk.green('app.module.ts updated successfully'));
    } catch (error) {
      console.error(chalk.red('Error updating app.module.ts'), error);
    }
  }
}
