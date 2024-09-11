export const dtoTemplate = (model: any): string => {
  const createDtoFields = model.fields.map((field: any) => {
    return `${getValidators(field, false)}\n  ${field.name}${field.isRequired ? '' : '?'}: ${getFieldType(field)};`;
  }).join('\n\n  ');

  const updateDtoFields = model.fields.map((field: any) => {
    return `${getValidators(field, true)}\n  ${field.name}?: ${getFieldType(field)};`;
  }).join('\n\n  ');

  return `
import { IsInt, IsString, IsBoolean, IsDate, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class Create${model.name}Dto {
  ${createDtoFields}
}

export class Update${model.name}Dto {
  ${updateDtoFields}
}
  `;
};

const getFieldType = (field: any): string => {
  switch (field.type) {
    case 'Int': return 'number';
    case 'String': return 'string';
    case 'Boolean': return 'boolean';
    case 'DateTime': return 'Date';
    case 'Json': return 'any';  
    default: return 'any';
  }
};

const getValidators = (field: any, isUpdate: boolean): string => {
  const validators = [];
  validators.push(getTypeValidator(field.type));
  if (!field!.isRequired! || isUpdate) {
    validators.push('@IsOptional()');
  }
  return validators.filter(Boolean).join('\n  ');
};

const getTypeValidator = (type: string): string | null => {
  switch (type) {
    case 'Int': return '@IsInt()';
    case 'String': return '@IsString()';
    case 'Boolean': return '@IsBoolean()';
    case 'DateTime': return `@IsDate()\n  @Transform(({ value }) => value ? new Date(value) : undefined)`;
    default: return null;
  }
};
