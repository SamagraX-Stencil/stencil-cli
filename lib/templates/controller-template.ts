export const controllerTemplate = (model: any): string => `
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ${model.name}Service } from '../services/${model.name.toLowerCase()}.service';
import { ${model.name} } from '../interfaces/${model.name.toLowerCase()}.interface';
import { Create${model.name}Dto, Update${model.name}Dto } from '../dto/${model.name.toLowerCase()}.dto';

@Controller('${model.name.toLowerCase()}')
export class ${model.name}Controller {
  constructor(private readonly ${model.name.toLowerCase()}Service: ${model.name}Service) {}

  @Get()
  async findAll(): Promise<${model.name}[]> {
    return this.${model.name.toLowerCase()}Service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<${model.name}> {
    return this.${model.name.toLowerCase()}Service.findOne(+id);
  }

  @Post()
  async create(@Body() create${model.name}Dto: Create${model.name}Dto): Promise<${model.name}> {
    return this.${model.name.toLowerCase()}Service.create(create${model.name}Dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() update${model.name}Dto: Update${model.name}Dto): Promise<${model.name}> {
    return this.${model.name.toLowerCase()}Service.update(+id, update${model.name}Dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.${model.name.toLowerCase()}Service.remove(+id);
  }
}
`;
