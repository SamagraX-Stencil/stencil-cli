import { exec } from 'child_process';
import { join } from 'path';
import { existsSync, readFileSync,writeFileSync, rmSync } from 'fs';
import * as yaml from 'js-yaml';

describe('Stencil cli e2e Test - SPEC command', () => {
  const specFilePath = join(process.cwd(), 'spec.yaml');
  const specFileContent = `
stencil: 0.0.1

info:
  properties:
    project-name: "Final"
    package-manager: "npm"

tooling: [logging]

endpoints:
`;

  beforeAll(() => {
    writeFileSync(specFilePath, specFileContent);
  });

  afterAll(() => {
    if (existsSync(specFilePath)) {
      rmSync(specFilePath);
    }
    const projectDir = join(process.cwd(), 'Final');
    if (existsSync(projectDir)) {
      rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it('should run the Stencil CLI with no arguments and log the error output', (done) => {
    exec('npx stencil spec', (error, stdout, stderr) => {
      expect(stderr).toContain("error: missing required argument 'filePath'");
      done();
    });
  },10000);

  it('should run the Stencil CLI with the "spec.yaml" file and check for directory structure', (done) => {
    exec(`npx stencil spec ${specFilePath}`, (error, stdout, stderr) => {
      if (error) {
        done(error);
        return;
      }
      console.log(stdout);
      const projectDir = join(process.cwd(), 'Final');
      expect(existsSync(projectDir)).toBe(true);

      const loggingServiceDir = join(projectDir, 'services', 'logging');
      expect(existsSync(loggingServiceDir)).toBe(true);

      done();
    });
  },10000);
});
