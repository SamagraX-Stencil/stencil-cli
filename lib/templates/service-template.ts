export const serviceTemplate = (model: any): string => `
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ${model.name} } from './${model.name.toLowerCase()}.interface';
import { Create${model.name}Dto, Update${model.name}Dto } from './dto/${model.name.toLowerCase()}.dto';

@Injectable()
export class ${model.name}Service {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<${model.name}[]> {
    return this.prisma.${model.name.toLowerCase()}.findMany();
  }

  async findOne(id: number): Promise<${model.name}> {
    return this.prisma.${model.name.toLowerCase()}.findUnique({
      where: { id },
    });
  }

  async create(data: Create${model.name}Dto): Promise<${model.name}> {
    return this.prisma.${model.name.toLowerCase()}.create({
      data,
    });
  }

  async update(id: number, data: Update${model.name}Dto): Promise<${model.name}> {
    return this.prisma.${model.name.toLowerCase()}.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.${model.name.toLowerCase()}.delete({
      where: { id },
    });
  }
}
`;
