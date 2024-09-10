import * as fs from 'fs';
import * as chalk from 'chalk';
import { addImports } from './import-manager';

export function addSwaggerControllers(controllerPath: string) {
  try {
    const content = fs.readFileSync(controllerPath, 'utf-8');
    let updatedContent = content;

    const httpMethods = {
      Get: /@Get\(['"]?[^'"]*['"]?\)?\s*\n\s*async\s+(\w+)\(([\w\s,@(){}:'"=]*)\)\s*:\s*Promise<([\w\[\]]+)>/g,
      Post: /@Post\(['"]?[^'"]*['"]?\)?\s*\n\s*async\s+(\w+)\(([\w\s,@(){}:'"=]*)\)\s*:\s*Promise<([\w\[\]]+)>/g,
      Put: /@Put\(['"]?[^'"]*['"]?\)?\s*\n\s*async\s+(\w+)\(([\w\s,@(){}:'"=]*)\)\s*:\s*Promise<([\w\[\]]+)>/g,
      Delete: /@Delete\(['"]?[^'"]*['"]?\)?\s*\n\s*async\s+(\w+)\(([\w\s,@(){}:'"=]*)\)\s*:\s*Promise<([\w\[\]]+)>/g
    };

    let processedMethods: Set<string> = new Set();

    for (const [method, regex] of Object.entries(httpMethods)) {
      let match;
      while ((match = regex.exec(updatedContent)) !== null) {
        const methodSignature = match[0];
        if (!processedMethods.has(methodSignature)) {
          processedMethods.add(methodSignature);
          const updatedMethod = replaceMethod(methodSignature, method);
          updatedContent = updatedContent.replace(methodSignature, updatedMethod);
        }
      }
    }

    if (!/@ApiTags\(/.test(updatedContent)) {
      const classRegex = /@Controller\(['"]([\w-]+)['"]\)/;
      updatedContent = updatedContent.replace(classRegex, (match, p1) => {
        return `${match}\n@ApiTags('${p1}')`;
      });
    }

    updatedContent = addImports(updatedContent,"controller");

    fs.writeFileSync(controllerPath, updatedContent, 'utf-8');
    console.info(chalk.green(`Swagger decorators added to ${controllerPath}`));
  } catch (error) {
    console.error(chalk.red(`Error adding Swagger decorators to ${controllerPath}`), error);
  }
}

function replaceMethod(methodSignature: string, method: string): string {
  const decorators = generateSwaggerDecorators(methodSignature, method);
  return decorators + methodSignature;
}

function generateSwaggerDecorators(methodSignature: string, method: string): string {
  let decorators = '';
  if (!/@ApiOperation\(/.test(methodSignature)) {
    decorators += `@ApiOperation({ summary: '${getOperationSummary(method)}' })\n`;
  }

  if (!/@ApiResponse\(/.test(methodSignature)) {
    decorators += `@ApiResponse({ status: 200, description: 'Successful response', type: '${getReturnType(methodSignature)}' })\n`;
  }

  if (/@Body\(/.test(methodSignature) && !/@ApiBody\(/.test(methodSignature)) {
    decorators += `@ApiBody({ type: ${getBodyType(methodSignature)}, description: 'Item data' })\n`;
  }

  if (/@Param\(['"]\w+['"]\)/.test(methodSignature) && !/@ApiParam\({ name: /.test(methodSignature)) {
    const paramName = getParamName(methodSignature);
    const paramType = getParamType(methodSignature);
    decorators += `@ApiParam({ name: '${paramName}', description: 'ID of the item', type: '${paramType}' })\n`;
  }

  if (method === 'Delete') {
    if (!/@ApiResponse\({ status: 204/.test(methodSignature)) {
      decorators += `@ApiResponse({ status: 204, description: 'Item deleted' })\n`;
    }
    if (!/@ApiResponse\({ status: 404/.test(methodSignature)) {
      decorators += `@ApiResponse({ status: 404, description: 'Item not found' })\n`;
    }
  }

  return decorators;
}

function getOperationSummary(method: string): string {
  switch (method) {
    case 'Get':
      return 'Retrieve items';
    case 'Post':
      return 'Create an item';
    case 'Put':
      return 'Update an item';
    case 'Delete':
      return 'Delete an item';
    default:
      return '';
  }
}

function getReturnType(methodSignature: string): string {
  const match = methodSignature.match(/:\s*Promise<([\w\s@(){}]+)>/);
  return match ? match[1].trim() : 'any';
}

function getBodyType(methodSignature: string): string {
  const match = methodSignature.match(/@Body\(\)\s*([\w<>,]+):\s*([\w<>,]+)/);
  return match ? match[2].trim() : 'any';
}

function getParamType(methodSignature: string): string {
  const match = methodSignature.match(/@Param\(\s*['"]\w+['"]\s*\)\s*\w+:\s*(\w+)/);
  return match ? match[1] : 'string';
}

function getParamName(methodSignature: string): string {
  const match = methodSignature.match(/@Param\(\s*['"](\w+)['"]\s*\)/);
  return match ? match[1] : 'id';
}
