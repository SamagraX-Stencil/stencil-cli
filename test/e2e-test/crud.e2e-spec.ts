import { exec } from 'child_process';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, rmSync, rm } from 'fs';

describe('Stencil CLI e2e Test - CRUD command', () => {
//   const testDir = join(__dirname, 'test-project');
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

  beforeAll(() => {
        writeFileSync(schemaFilePath, schemaFileContent);
  });

  afterAll(() => {
    rmSync(schemaFilePath);
    ['book', 'book1', 'car'].forEach((model) => {
      const modelDir = join('src', model);
      if (existsSync(modelDir)) {
        rmSync(modelDir, { recursive: true, force: true });
      }
      rmSync('src', { recursive: true, force: true });
      rmSync('dmmf.json', { recursive: true, force: true });

    });

  });

  it('should log an error when no model is provided', (done) => {
    exec('npx stencil crud', (error, stdout, stderr) => {
      expect(stderr).toContain('No model provided. Please specify a model or use "*" to generate all models.');
      done();
    });
  });

  it('should generate files for the Book model', (done) => {
    exec('npx stencil crud Book', (error, stdout, stderr) => {
      expect(error).toBeNull();
      const modelDir = join('src', 'book');
      expect(existsSync(modelDir)).toBeTruthy();
      expect(existsSync(join(modelDir, 'book.controller.ts'))).toBeTruthy();
      expect(existsSync(join(modelDir, 'book.service.ts'))).toBeTruthy();
      expect(existsSync(join(modelDir, 'book.interface.ts'))).toBeTruthy();
      expect(existsSync(join(modelDir, 'dto', 'book.dto.ts'))).toBeTruthy();
      done();
    });
  });

  it('should generate files for all models', (done) => {
    exec('npx stencil crud *', (error, stdout, stderr) => {
      expect(error).toBeNull();
      ['book', 'book1', 'car'].forEach((model) => {
        const modelDir = join('src', model);
        expect(existsSync(modelDir)).toBeTruthy();
        expect(existsSync(join(modelDir, `${model}.controller.ts`))).toBeTruthy();
        expect(existsSync(join(modelDir, `${model}.service.ts`))).toBeTruthy();
        expect(existsSync(join(modelDir, `${model}.interface.ts`))).toBeTruthy();
        expect(existsSync(join(modelDir, 'dto', `${model}.dto.ts`))).toBeTruthy();
      });
      done();
    });
  });

});
