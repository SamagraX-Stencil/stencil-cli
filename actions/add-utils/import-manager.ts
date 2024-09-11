export function addImports(content: string, fileType: 'controller' | 'dto'): string {
  const existingSwaggerImports = content.match(/import\s+{\s*([^}]+)\s*}\s+from\s+'@nestjs\/swagger';/);
  
  let swaggerDecorators: string[];

  switch (fileType) {
    case 'controller':
      swaggerDecorators = ['ApiOperation', 'ApiResponse', 'ApiParam', 'ApiBody', 'ApiTags'];
      break;
    case 'dto':
      swaggerDecorators = ['ApiProperty', 'ApiPropertyOptional'];
      break;
    default:
      throw new Error('Unsupported file type');
  }

  const existingDecorators = existingSwaggerImports ? existingSwaggerImports[1].split(',').map((d) => d.trim()) : [];
  const newDecorators = swaggerDecorators.filter((d) => !existingDecorators.includes(d));

  if (newDecorators.length > 0) {
    const newImportStatement = `import { ${[...existingDecorators, ...newDecorators].join(', ')} } from '@nestjs/swagger';`;
    if (existingSwaggerImports) {
      content = content.replace(existingSwaggerImports[0], newImportStatement);
    } else {
      const lastImportIndex = content.lastIndexOf('import ');
      const insertPosition = content.indexOf(';', lastImportIndex) + 1;
      content = `${content.slice(0, insertPosition)}\n${newImportStatement}${content.slice(insertPosition)}`;
    }
  }

  return content;
}
