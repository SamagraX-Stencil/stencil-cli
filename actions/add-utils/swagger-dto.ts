import * as fs from 'fs';
import * as path from 'path';
import { addImports } from './import-manager';
import * as chalk from 'chalk';

export function addSwaggerDto(dtoFilePath: string) {

  const dtoContent = fs.readFileSync(dtoFilePath, 'utf-8');

  let updatedContent = addSwaggerDecorators(dtoContent);
  updatedContent = addImports(updatedContent, 'dto');

  fs.writeFileSync(dtoFilePath, updatedContent, 'utf-8');
  console.info(chalk.green(`Swagger decorators added to ${dtoFilePath}`));
}

const addSwaggerDecorators = (content: string): string => {
  const lines = content.split('\n');

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
