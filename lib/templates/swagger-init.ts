import * as fs from 'fs';
import * as chalk from 'chalk';


export class addSwaggerInitialization{
    public async handle() {
    
    const mainPath = 'src/main.ts';
    const importStatement = `import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';`;
    const setupCall = `
      const config = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('The API description')
        .setVersion('1.0')
        .addTag('api')
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document);
    `;

    try {
      let mainContent = fs.readFileSync(mainPath, 'utf-8');

      if (!mainContent.includes(importStatement)) {
        mainContent = mainContent.replace(
          /import { ValidationPipe } from '@nestjs\/common';/,
          `import { ValidationPipe } from '@nestjs/common';\n${importStatement}`
        );
        console.info(chalk.green('Swagger import added to main.ts'));
      }

      if (!mainContent.includes('SwaggerModule.setup')) {
        mainContent = mainContent.replace(
          /app\.useGlobalPipes\(new ValidationPipe\(\)\);/,
          `app.useGlobalPipes(new ValidationPipe());\n${setupCall}`
        );
        console.info(chalk.green('Swagger setup added to main.ts'));
      } else {
        console.info(chalk.yellow('Swagger already initialized in main.ts'));
      }

      fs.writeFileSync(mainPath, mainContent, 'utf-8');
    } catch (error) {
      console.error(chalk.red(`Error adding Swagger initialization to ${mainPath}`), error);
    }
  }
}
