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

it('should log an error if the spec file does not exist', (done) => {
  const nonExistentSpecFilePath = "non-existent-spec.yaml";
  exec(`stencil spec ${nonExistentSpecFilePath}`, (error, stdout, stderr) => {
    expect(stderr).toContain(`File not found: ${nonExistentSpecFilePath}`);
    done();
  });
});

it('should log an error if the spec file is empty', (done) => {
  writeFileSync(specFilePath, '');
  exec(`stencil spec ${specFilePath}`, (error, stdout, stderr) => {
    expect(stderr).toContain("Specification file is empty");
    rmSync(specFilePath);
    done();
  });
});

  it('should run the Stencil CLI spec command with no path argument and log the error output', (done) => {
    exec('stencil spec', (error, stdout, stderr) => {
      expect(stderr).toContain("Missing required argument filePath");
      done();
    });
  },);

  it('should log an error if the spec file has invalid file extension', (done) => {
    const invalidSpecFilePath = "invalid-spec";
    exec(`stencil spec ${invalidSpecFilePath}`, (error, stdout, stderr) => {
      expect(stderr).toContain("Specification file should be a Yaml file");
      done();
    });
  });


  it('should log an error if the spec file has invalid YAML format', (done) => {
    writeFileSync(specFilePath, 'invalid: yaml: content');
    exec(`stencil spec ${specFilePath}`, (error, stdout, stderr) => {
      expect(stderr).toContain("Error reading specification file");
      rmSync(specFilePath);
      done();
    });
  });
  
  it('should log an error if the project-name is missing in the spec file', (done) => {
    const invalidSpecFileContent = `stencil: 0.0.1
  info:
    properties:
      package-manager: "npm"
  tooling: [temporal]`;
  
    writeFileSync(specFilePath, invalidSpecFileContent);
    exec(`stencil spec ${specFilePath}`, (error, stdout, stderr) => {
      expect(stderr).toContain("Error reading specification file");
      rmSync(specFilePath);
      done();
    });
  });

  it('should log an error if the package-manager is missing in the spec file', (done) => {
    const invalidSpecFileContent = `stencil: 0.0.1
  info:
    properties:
      project-name: "final"
  tooling: [temporal]`;
  
    writeFileSync(specFilePath, invalidSpecFileContent);
    exec(`stencil spec ${specFilePath}`, (error, stdout, stderr) => {
      expect(stderr).toContain("Error reading specification file");
      rmSync(specFilePath);
      done();
    });
  });

  it('should run the Stencil CLI with the "spec.yaml" file and check for directory structure', (done) => {
    writeFileSync(specFilePath, specFileContent);
    exec(`stencil spec ${specFilePath}`, (error, stdout, stderr) => {
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
