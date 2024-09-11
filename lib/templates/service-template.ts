export const serviceTemplate = (model: any): string => {
  const modelName = model.name;
  const modelNameLowerCase = modelName.toLowerCase();

  return `
import { Injectable } from '@nestjs/common';
import { ${modelName} } from './${modelNameLowerCase}.interface';
import { Create${modelName}Dto, Update${modelName}Dto } from './dto/${modelNameLowerCase}.dto';

@Injectable()
export class ${modelName}Service {
  private ${modelNameLowerCase}s: ${modelName}[] = [];
  private idCounter: number = 1;

  async findAll(): Promise<${modelName}[]> {
    return this.${modelNameLowerCase}s;
  }

  async findOne(id: number): Promise<${modelName}> {
    return this.${modelNameLowerCase}s.find(${modelNameLowerCase} => ${modelNameLowerCase}.id === id);
  }

  async create(data: Create${modelName}Dto): Promise<${modelName}> {
    const new${modelName}: ${modelName} = {
      id: this.idCounter++,
      ...data,
    };
    this.${modelNameLowerCase}s.push(new${modelName});
    return new${modelName};
  }

  async update(id: number, data: Update${modelName}Dto): Promise<${modelName}> {
    const ${modelNameLowerCase}Index = this.${modelNameLowerCase}s.findIndex(${modelNameLowerCase} => ${modelNameLowerCase}.id === id);
    if (${modelNameLowerCase}Index === -1) {
      return null;
    }
    this.${modelNameLowerCase}s[${modelNameLowerCase}Index] = { ...this.${modelNameLowerCase}s[${modelNameLowerCase}Index], ...data };
    return this.${modelNameLowerCase}s[${modelNameLowerCase}Index];
  }

  async remove(id: number): Promise<boolean> {
    const ${modelNameLowerCase}Index = this.${modelNameLowerCase}s.findIndex(${modelNameLowerCase} => ${modelNameLowerCase}.id === id);
    if(${modelNameLowerCase}Index === -1) {
        return false;
    }
    this.${modelNameLowerCase}s.splice(${modelNameLowerCase}Index, 1);
    return true;
  }
}
`;
};
