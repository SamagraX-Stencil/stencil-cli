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

  public async handle(inputs: Input[] = []) {
    this.manager = await PackageManagerFactory.find();
    await this.generateCrud(inputs);
  }

  private async generateCrud(inputs: Input[]): Promise<void> {
    try {
      console.info(chalk.green('Generating CRUD API'));

      const dmmf = await this.generateDMMFJSON();
      if (dmmf) {
        const existingModels = dmmf.datamodel.models.map((model: any) => model.name);
        
        if (inputs.length === 0) {
          inputs = existingModels.map((modelName: any) => ({ name: modelName, value: modelName }));
        } else {
          const invalidInputs = inputs.filter(input => !existingModels.includes(input.name));

          if (invalidInputs.length > 0) {
            console.error(chalk.red('The following models do not exist:'), invalidInputs.map(input => input.name).join(', '));
            return;
          }
        }

        this.generateTypes(dmmf, inputs);
        this.createAPIs(dmmf, inputs);
        this.updateAppModule(dmmf, inputs);
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

  private generateTypes(dmmf: any, inputs: Input[]): void {
    try {
      const modelNames = inputs.map(input => input.name);
      const models = dmmf.datamodel.models.filter((model: any) =>
        modelNames.includes(model.name)
      );

      models.forEach((model: any) => {
        const interfaceDir = './src/interfaces';
        const dtoDir = './src/dto';
        if (!fs.existsSync(interfaceDir)) {
          fs.mkdirSync(interfaceDir, { recursive: true });
        }
        if (!fs.existsSync(dtoDir)) {
          fs.mkdirSync(dtoDir, { recursive: true });
        }

        const interfaceContent = this.interfaceTemplate(model);
        fs.writeFileSync(`${interfaceDir}/${model.name.toLowerCase()}.interface.ts`, interfaceContent);

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

  private createAPIs(dmmf: any, inputs: Input[]): void {
    try {
      const modelNames = inputs.map(input => input.name);
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
    const controllerDir = `./src/controllers`;
    const serviceDir = `./src/services`;

    if (!fs.existsSync(controllerDir)) {
      fs.mkdirSync(controllerDir, { recursive: true });
    }
    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
    }

    const controllerPath = `${controllerDir}/${model.name.toLowerCase()}.controller.ts`;
    const servicePath = `${serviceDir}/${model.name.toLowerCase()}.service.ts`;

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

  private updateAppModule(dmmf: any, inputs: Input[]): void {
    try {
      const modelNames = inputs.map(input => input.name);
      const models = dmmf.datamodel.models.filter((model: any) =>
        modelNames.includes(model.name)
      );
      const imports = models.map((model: any) => {
        const controllerImport = `import { ${model.name}Controller } from './controllers/${model.name.toLowerCase()}.controller';`;
        const serviceImport = `import { ${model.name}Service } from './services/${model.name.toLowerCase()}.service';`;

        return `${serviceImport}\n${controllerImport}`;
      }).join('\n');

      const controllers = models.map((model: any) => `${model.name}Controller`).join(',\n  ');
      const providers = models.map((model: any) => `${model.name}Service`).join(',\n  ');

      const appModulePath = './src/app.module.ts';
      let appModuleContent = fs.readFileSync(appModulePath, 'utf-8');
  
      const existingImports: string[] = appModuleContent.match(/import {[^}]*} from '[@a-zA-Z0-9\/]*';/g) || [];
      const newImports: string[] = imports.split('\n').filter((importLine: string) => !existingImports.includes(importLine));
      
      appModuleContent = appModuleContent.replace(
        /(import {[^}]*} from '[@a-zA-Z0-9\/]*';\n*)+/,
        `$&${newImports.join('\n')}\n`
      );  
      appModuleContent = appModuleContent.replace(
        /providers: \[\n([^]*)\n\]/,
        `providers: [\n$1\n  ${providers}]`
      );

      appModuleContent = appModuleContent.replace(
        /controllers: \[\n([^]*)\n\]/,
        `controllers: [\n$1\n  ${controllers}]`
      );
      
      const controllersIndex = appModuleContent.indexOf('controllers: [') + 'controllers: ['.length;
      appModuleContent =
        appModuleContent.slice(0, controllersIndex) +
        ` ${controllers},` +
        appModuleContent.slice(controllersIndex);
      const providerIndex = appModuleContent.indexOf('providers: [') + 'providers: ['.length;
      appModuleContent =
        appModuleContent.slice(0, providerIndex) +
        ` ${providers},` +
        appModuleContent.slice(providerIndex);  
  
      fs.writeFileSync(appModulePath, appModuleContent);
      console.info(chalk.green('app.module.ts updated successfully'));
    } catch (error) {
      console.error(chalk.red('Error updating app.module.ts'), error);
    }
  }
}
