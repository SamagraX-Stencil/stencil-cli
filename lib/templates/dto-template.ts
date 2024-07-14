export const dtoTemplate = (model: any): string => {
    const createDtoFields = model.fields.map((field: any) => {
      return `${field.name}${field.isRequired ? '' : '?'}: ${getFieldType(field)};`;
    }).join('\n  ');
  
    const updateDtoFields = model.fields.map((field: any) => {
      return `${field.name}?: ${getFieldType(field)};`;
    }).join('\n  ');
  
    return `
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
  