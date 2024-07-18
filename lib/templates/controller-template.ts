export function controllerTemplate(model: any): string {
  const modelName = model.name;
  const modelNameLowerCase = modelName.toLowerCase();

  const swaggerImports = `
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { ${modelName}Service } from './${modelNameLowerCase}.service';
import { Create${modelName}Dto, Update${modelName}Dto } from './dto/${modelNameLowerCase}.dto';
import { ${modelName} } from './${modelNameLowerCase}.interface';
`;

  const controllerClass = `
@ApiTags('${modelName}')
@Controller('${modelNameLowerCase}')
export class ${modelName}Controller {
  constructor(private readonly ${modelNameLowerCase}Service: ${modelName}Service) {}

  @ApiOperation({ summary: 'Get all ${modelNameLowerCase}s' })
  @ApiResponse({ status: 200, description: 'Return all ${modelNameLowerCase}s.' })
  @Get()
  async findAll(): Promise<${modelName}[]> {
    return this.${modelNameLowerCase}Service.findAll();
  }

  @ApiOperation({ summary: 'Get ${modelNameLowerCase} by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the ${modelNameLowerCase} to find' })
  @ApiResponse({ status: 200, description: 'Return the ${modelNameLowerCase}.' })
  @ApiResponse({ status: 404, description: '${modelName} not found.' })
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<${modelName} | undefined> {
    return this.${modelNameLowerCase}Service.findOne(id);
  }

  @ApiOperation({ summary: 'Create ${modelNameLowerCase}' })
  @ApiBody({ type: Create${modelName}Dto })
  @ApiResponse({ status: 201, description: 'The ${modelNameLowerCase} has been successfully created.' })
  @Post()
  async create(@Body() ${modelNameLowerCase}Dto: Create${modelName}Dto): Promise<${modelName}> {
    return this.${modelNameLowerCase}Service.create(${modelNameLowerCase}Dto);
  }

  @ApiOperation({ summary: 'Update ${modelNameLowerCase} by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the ${modelNameLowerCase} to update' })
  @ApiBody({ type: Update${modelName}Dto })
  @ApiResponse({ status: 200, description: 'The ${modelNameLowerCase} has been successfully updated.' })
  @ApiResponse({ status: 404, description: '${modelName} not found.' })
  @Put(':id')
  async update(@Param('id') id: number, @Body() ${modelNameLowerCase}Dto: Update${modelName}Dto): Promise<${modelName} | undefined> {
    return this.${modelNameLowerCase}Service.update(id, ${modelNameLowerCase}Dto);
  }

  @ApiOperation({ summary: 'Delete ${modelNameLowerCase} by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the ${modelNameLowerCase} to delete' })
  @ApiResponse({ status: 200, description: 'The ${modelNameLowerCase} has been successfully deleted.' })
  @ApiResponse({ status: 404, description: '${modelName} not found.' })
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.${modelNameLowerCase}Service.remove(id);
  }
}
`;

  return `${swaggerImports}${controllerClass}`;
}
