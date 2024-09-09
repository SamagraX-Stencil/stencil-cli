export function controllerTemplate(model: any): string {
  const modelName = model.name;
  const modelNameLowerCase = modelName.toLowerCase();

  const swaggerImports = `
import { Controller, Get, Param, Post, Body, Put, Delete, NotFoundException } from '@nestjs/common';
import { ${modelName}Service } from './${modelNameLowerCase}.service';
import { Create${modelName}Dto, Update${modelName}Dto } from './dto/${modelNameLowerCase}.dto';
import { ${modelName} } from './${modelNameLowerCase}.interface';
`;

  const controllerClass = `
@Controller('${modelNameLowerCase}')
export class ${modelName}Controller {
  constructor(private readonly ${modelNameLowerCase}Service: ${modelName}Service) {}

@Get()
  async findAll(): Promise<${modelName}[]> {
    return this.${modelNameLowerCase}Service.findAll();
  }

@Get(':id')
  async findOne(@Param('id') id: string): Promise<${modelName}> {
    const ${modelNameLowerCase}Id = parseInt(id, 10);
    const ${modelNameLowerCase} = await this.${modelNameLowerCase}Service.findOne(${modelNameLowerCase}Id);
    if (!${modelNameLowerCase}) {
      throw new NotFoundException(\`${modelName} with ID \${id} not found\`);
    }
    return ${modelNameLowerCase};
  }

@Post()
  async create(@Body() ${modelNameLowerCase}Dto: Create${modelName}Dto): Promise<${modelName}> {
    return this.${modelNameLowerCase}Service.create(${modelNameLowerCase}Dto);
  }

@Put(':id')
  async update(@Param('id') id: string, @Body() ${modelNameLowerCase}Dto: Update${modelName}Dto): Promise<${modelName}> {
    const ${modelNameLowerCase}Id = parseInt(id, 10);
    const updated${modelName} = await this.${modelNameLowerCase}Service.update(${modelNameLowerCase}Id, ${modelNameLowerCase}Dto);
    if (!updated${modelName}) {
      throw new NotFoundException(\`${modelName} with ID \${id} not found\`);
    }
    return updated${modelName};
  }

@Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const ${modelNameLowerCase}Id = parseInt(id, 10);
    const result = await this.${modelNameLowerCase}Service.remove(${modelNameLowerCase}Id);
    if (!result) {
      throw new NotFoundException(\`${modelName} with ID \${id} not found\`);
    }
  }
}
`;

  return `${swaggerImports}${controllerClass}`;
}
