import { exec } from 'child_process';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, rmSync, rm } from 'fs';

describe('Stencil CLI e2e Test - CRUD & Swagger commands', () => {
  const schemaFilePath = join('schema.prisma');
  const schemaFileContent = `
  model Book {
    id Int @id @default(autoincrement())
    title String
    description String?
  }
  model Book1 {
    id Int @id @default(autoincrement())
    title String
    description String?
  }
  model Car {
    id Int @id @default(autoincrement())
    title String
    description String?
    phone Int
    add String
  }
  `;

  beforeAll((done) => {
    exec('stencil new test-project --prisma no --user-service no --monitoring no --monitoringService no --temporal no --logging no --fileUpload no --package-manager npm', (newError, newStdout, newStderr) => {
      expect(newError).toBeNull();
      process.chdir('test-project'); 
      
      writeFileSync(schemaFilePath, schemaFileContent);
      done();
    });
  },60000);


  afterAll(() => {
    process.chdir('..'); 
    rmSync('test-project', { recursive: true, force: true });
  });


  it('should log an error when no model is provided', (done) => {
    exec('stencil crud', (error, stdout, stderr) => {
      expect(stderr).toContain('No model provided. Please specify a model or use "*" to generate all models.');
      done();
    });
  });

  it('should log an error for an empty or missing Prisma schema file', (done) => {
    rmSync(schemaFilePath);

    exec('stencil crud Book', (error, stdout, stderr) => {
      expect(stderr).toContain('Error generating DMMF JSON');
      writeFileSync(schemaFilePath, schemaFileContent);
      done();
    });
  });

  it('should generate files for a single model', (done) => {
    exec('stencil crud Book', (error, stdout, stderr) => {
      expect(error).toBeNull();
      const modelDir = join('src', 'book');
      expect(existsSync(modelDir)).toBeTruthy();
      expect(
        [`book.controller.ts`, `book.service.ts`, `book.interface.ts`, `dto/book.dto.ts`]
          .map(file => existsSync(join(modelDir, file)))
          .every(exists => exists)
      ).toBeTruthy();
      });      done();
    });

  it('should generate files for non-existing model', (done) => {
    exec('stencil crud Random', (error, stdout, stderr) => {
      expect(stderr).toContain('The following models do not exist: Random');
      done();
    });
  });


  it('should generate files for all models', (done) => {
    exec('stencil crud *', (error, stdout, stderr) => {
      expect(error).toBeNull();
      ['book', 'book1', 'car'].forEach((model) => {
        const modelDir = join('src', model);
        expect(existsSync(modelDir)).toBeTruthy();
        expect(
          [`${model}.controller.ts`, `${model}.service.ts`, `${model}.interface.ts`, `dto/${model}.dto.ts`]
            .map(file => existsSync(join(modelDir, file)))
            .every(exists => exists)
        ).toBeTruthy();
        });
      done();
    });
  });

  it('should log error for wrong/missing model while adding Swagger decorators', (done) => {
    exec('stencil crud Book', (crudError, crudStdout, crudStderr) => {
      expect(crudError).toBeNull();
      exec('stencil add swagger src/random', (swaggerError, swaggerStdout, swaggerStderr) => {
        expect(swaggerStderr).toContain('Controller file not found in path: src/random');
        done();
      });
    });
  });

  it('should add Swagger decorators for the Book model', (done) => {
    exec('stencil crud Book', (crudError, crudStdout, crudStderr) => {
      expect(crudError).toBeNull();
      const modelDir = join('src', 'book');
      expect(existsSync(modelDir)).toBeTruthy();
      exec('stencil add swagger src/book', (swaggerError, swaggerStdout, swaggerStderr) => {
        expect(swaggerError).toBeNull();
        
        const controllerPath = join('src', 'book', 'book.controller.ts');
        const controllerContent = readFileSync(controllerPath, 'utf-8');
        
        expect(existsSync(controllerPath)).toBeTruthy();

        const controllerDecorators = ['@ApiOperation', '@ApiResponse', '@ApiParam', '@ApiBody', '@ApiTags'];
        controllerDecorators.forEach(decorator => {
          expect(controllerContent).toContain(decorator);
        });

        const dtoPath = join('src', 'book', 'dto', 'book.dto.ts');
        const dtoContent = readFileSync(dtoPath, 'utf-8');

        expect(existsSync(dtoPath)).toBeTruthy();

        const dtoDecorators = ['@ApiProperty', '@ApiPropertyOptional'];
        dtoDecorators.forEach(decorator => {
          expect(dtoContent).toContain(decorator);
        });
        
        done();
      });
    });
  });


  it('should log error for missing dto while adding Swagger decorators', (done) => {
    exec('stencil crud Book', (crudError, crudStdout, crudStderr) => {
      rmSync(join('src', 'book', 'dto', 'book.dto.ts'));
      expect(crudError).toBeNull();

      exec('stencil add swagger src/book', (swaggerError, swaggerStdout, swaggerStderr) => {
        expect(swaggerStderr).toContain('DTO file not found for model: src/book');
        done();
      });
    });
  });


  it('should check Swagger initialization in main.ts', (done) => {
    exec('stencil crud Book', (crudError, crudStdout, crudStderr) => {
      expect(crudError).toBeNull();
      const modelDir = join('src', 'book');
      expect(existsSync(modelDir)).toBeTruthy();
      exec('stencil add swagger src/book --init', (swaggerError, swaggerStdout, swaggerStderr) => {
        expect(swaggerError).toBeNull();
        
        const mainTsPath = join('src', 'main.ts');
        const mainTsContent = readFileSync(mainTsPath, 'utf-8');

        expect(mainTsContent).toContain("SwaggerModule.setup('api', app, document);");

        done();
      });
    });
  });
});
