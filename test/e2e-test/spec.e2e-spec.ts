import { exec } from 'child_process';
import { join } from 'path';
import { existsSync, readFileSync,writeFileSync, rmSync } from 'fs';
import * as yaml from 'js-yaml';

describe('Stencil cli e2e Test - SPEC command', () => {
  const specFilePath = join('spec.yaml');
  const specFileContent = `stencil: 0.0.1

info:
  properties:
    project-name: "final"
    package-manager: "npm"

tooling: [temporal]

endpoints:
`;

  it('should run the Stencil CLI with no arguments and log the error output', (done) => {
    exec('npx stencil spec', (error, stdout, stderr) => {
      expect(stderr).toContain("error: missing required argument 'filePath'");
      done();
    });
  },);

  it('should run the Stencil CLI with the "spec.yaml" file and check for directory structure', (done) => {
    writeFileSync(specFilePath, specFileContent);
    exec(`npx stencil spec ${specFilePath}`, (error, stdout, stderr) => {
      if (error) {
        done(error);
        return;
      }
      const projectDir = join(process.cwd(), 'final');
      expect(existsSync(projectDir)).toBe(true);

      const ServiceDir = join(projectDir, 'services', 'temporal');
      expect(existsSync(ServiceDir)).toBe(true);
      rmSync(specFilePath);
      rmSync(projectDir, { recursive: true, force: true })
      done();
    });
  },50000);
});
