export function controllerTemplate(model: any): string {
  const modelName = model.name;
  const modelNameLowerCase = modelName.toLowerCase();

  const swaggerImports = `
import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
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
  async findOne(@Param('id') id: number): Promise<${modelName} | undefined> {
    return this.${modelNameLowerCase}Service.findOne(id);
  }

  @Post()
  async create(@Body() ${modelNameLowerCase}Dto: Create${modelName}Dto): Promise<${modelName}> {
    return this.${modelNameLowerCase}Service.create(${modelNameLowerCase}Dto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() ${modelNameLowerCase}Dto: Update${modelName}Dto): Promise<${modelName} | undefined> {
    return this.${modelNameLowerCase}Service.update(id, ${modelNameLowerCase}Dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.${modelNameLowerCase}Service.remove(id);
  }
}
`;

  return `${swaggerImports}${controllerClass}`;
}
