import * as fs from 'fs';
import * as chalk from 'chalk';
import { join } from 'path';
import { findProjectRoot } from './file-utils';

export function addSwaggerInitialization() {
  const projectRoot = findProjectRoot();
  const mainPath = join(projectRoot, 'src', 'main.ts');

  try {
    let mainContent = fs.readFileSync(mainPath, 'utf-8');

    if (!/import\s+{\s*SwaggerModule\s*,\s*DocumentBuilder\s*}\s+from\s+'@nestjs\/swagger';/.test(mainContent)) {
      mainContent = mainContent.replace(
        'import { NestFactory } from \'@nestjs/core\';',
        `import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';`
      );
    }

    if (!/const\s+config\s+=\s+new\s+DocumentBuilder\(\)/.test(mainContent)) {
      mainContent = mainContent.replace(
        /await\s+app\.listen\(\d+\);/,
        `const config = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('The API description')
  .setVersion('1.0')
  .addTag('api')
  .build();

 const document = SwaggerModule.createDocument(app, config);
 SwaggerModule.setup('api', app, document);

 await app.listen(3000);`
      );
    }

    fs.writeFileSync(mainPath, mainContent, 'utf-8');
    console.info(chalk.green('Swagger initialized in main.ts'));

  } catch (error) {
    console.error(chalk.red(`Error adding Swagger initialization to ${mainPath}`), error);
  }
}
