import { existsSync } from 'fs';
import { join } from 'path';

export function getControllerFilePath(controllerFolder: string): string | null {
  const controllerFilePath = join(process.cwd(), 'src', controllerFolder, `${controllerFolder}.controller.ts`);
  if (existsSync(controllerFilePath)) {
    return controllerFilePath;
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
