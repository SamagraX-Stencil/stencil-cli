import * as fs from 'fs';
import * as path from 'path';
import { addImports } from './import-manager';
import * as chalk from 'chalk';
export function addSwaggerDto(controllerName: string) {
  const dtoDir = path.join(process.cwd(), 'src', controllerName, 'dto');
  if (!fs.existsSync(dtoDir)) {
    console.error(`DTO directory not found: ${dtoDir}`);
    return;
  }

  const dtoFiles = fs.readdirSync(dtoDir).filter(file => file.endsWith('.ts'));

  dtoFiles.forEach(file => {
    const dtoPath = path.join(dtoDir, file);
    const dtoContent = fs.readFileSync(dtoPath, 'utf-8');

    let updatedContent = addSwaggerDecorators(dtoContent);

    updatedContent = addImports(updatedContent,"dto");

    fs.writeFileSync(dtoPath, updatedContent, 'utf-8');
    console.info(chalk.green(`Swagger decorators added to ${dtoPath}`));
  });
}

const addSwaggerDecorators = (content: string): string => {
  const lines = content.split('\n');

//   const hasSwaggerImports = lines.some(line => line.includes('@nestjs/swagger'));
//   if (!hasSwaggerImports) {
//     lines.splice(1, 0, "import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';");
//   }

  const updatedLines = lines.map(line => {
    if (line.includes('export class Create') || line.includes('export class Update')) {
      return line;
    }

    if (line.includes(':')) {
      const [name, type] = line.split(':');
      const isOptional = name.includes('?');
      const decorator = isOptional ? '@ApiPropertyOptional' : '@ApiProperty';
      return `  ${decorator}({ description: '${name.trim()}' })\n  ${line}`;
    }

    return line;
  });

  return updatedLines.join('\n');
};
