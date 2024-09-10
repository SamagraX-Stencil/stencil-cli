import { existsSync } from 'fs';
import { join, basename } from 'path';

export function getControllerFilePath(modelName: string): string | null {
  const controllerFilePath = join(process.cwd(), modelName, `${basename(modelName)}.controller.ts`);
  if (existsSync(controllerFilePath)) {
    return controllerFilePath;
  }
  return null;
}

export function getDtoFilePath(modelName: string): string | null {
  const dtoFilePath = join(process.cwd(), modelName, 'dto',`${basename(modelName)}.dto.ts`);
  if (existsSync(dtoFilePath)) {
    return dtoFilePath;
  }
  return null;
}

export function findProjectRoot(): string {
  let dir = process.cwd();
  while (dir !== '/') {
    if (existsSync(join(dir, 'package.json'))) {
      return dir;
    }
    dir = join(dir, '..');
  }
  throw new Error('Project root not found');
}
