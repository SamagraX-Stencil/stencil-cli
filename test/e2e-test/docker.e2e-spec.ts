import { exec } from 'child_process';
import { join } from 'path';
import { existsSync, readFileSync, rmSync } from 'fs';
import * as yaml from 'js-yaml';

describe('Stencil cli e2e Test - DOCKER command', () => {
  it('should run the Stencil CLI with the "docker" command and log the output', (done) => {
    exec('npx stencil docker', (error, stdout, stderr) => {
      expect(stderr).toContain("missing required argument 'services'");
      done();
    });
  });

  it('should throw error for invalid "docker" command and log the output', (done) => {
    const service = 'service1';
    exec(`npx stencil docker ${service}`, (error, stdout, stderr) => {
      expect(stdout).toContain('');
      expect(stderr).toContain(`Invalid schematic "${service}". Please, ensure that "${service}" exists in this collection.`);
      done();
    });
  });

  it('should run "docker" command with tooling services and check if the folder is generated', (done) => {
    const services = ['monitoringService', 'logging', 'temporal'];
    const child = exec(`npx stencil docker ${services.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        child.kill();
        done(error);
        return;
      }
      expect(stdout).toContain('');
      services.forEach((service) => {
        expect(stderr).not.toContain(`Invalid schematic "${service}". Please, ensure that "${service}" exists in this collection.`);
        const dockerFolder = join(process.cwd(), 'docker', service);
        expect(existsSync(dockerFolder)).toBe(true);
        rmSync(dockerFolder, { recursive: true, force: true });
      });
      rmSync(join(process.cwd(), 'docker'), { recursive: true, force: true });

      child.kill();
      done();
    });
  },10000 );

  it('should run "docker" command with adhoc services and check if the docker compose is updated', (done) => {
    const services = ['postgres', 'hasura'];
    const child = exec(`npx stencil docker ${services.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        child.kill();
        done(error);
        return;
      }
      services.forEach((service) => {
        expect(stderr).not.toContain(`Invalid schematic "${service}". Please, ensure that "${service}" exists in this collection.`);
      });

      const dockerComposeFile = join(process.cwd(), 'docker-compose.yml');
      expect(existsSync(dockerComposeFile)).toBe(true);

      const dockerComposeContent = readFileSync(dockerComposeFile, 'utf8');
      const dockerComposeConfig = yaml.load(dockerComposeContent) as any;

      expect(dockerComposeConfig.services.postgres).toBeDefined();
      expect(dockerComposeConfig.services.hasura).toBeDefined();

      rmSync(dockerComposeFile, { force: true });
      rmSync(join(process.cwd(),'.env'), { recursive: true, force: true });
      rmSync(join(process.cwd(),'docker-start.sh'), { recursive: true, force: true });

      child.kill();
      done();
    });
  }, );

  it('should throw error for "docker" command with wrong path flag', (done) => {
    const services = ['postgres', 'hasura'];
    const child = exec(`npx stencil docker ${services.join(' ')} --path`, (error, stdout, stderr) => {
      services.forEach((service) => {
        expect(stderr).toContain(`Schematic input does not validate against the Schema: {"name":"${service}","language":"ts","path":true}`);
        expect(stderr).toContain(`Data path "/path" must be string.`);
      });
      
      child.kill();
      done();
    });
  }, );

  it('should run "docker" command with path flag', (done) => {
    const services = ['postgres', 'hasura'];
    const child = exec(`npx stencil docker ${services.join(' ')} --path temp`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        child.kill();
        done(error);
        return;
      }
      services.forEach((service) => {
        expect(stderr).not.toContain(`Invalid schematic "${service}". Please, ensure that "${service}" exists in this collection.`);
      });

      const dockerComposeFile = join(process.cwd(),'temp', 'docker-compose.yml');
      expect(existsSync(dockerComposeFile)).toBe(true);

      const dockerComposeContent = readFileSync(dockerComposeFile, 'utf8');
      const dockerComposeConfig = yaml.load(dockerComposeContent) as any;

      expect(dockerComposeConfig.services.postgres).toBeDefined();
      expect(dockerComposeConfig.services.hasura).toBeDefined();

      rmSync(dockerComposeFile, { force: true });
      rmSync(join(process.cwd(),'temp','.env'), { recursive: true, force: true });
      rmSync(join(process.cwd(),'docker-start.sh'), { recursive: true, force: true });
      rmSync(join(process.cwd(), 'temp'), { recursive: true, force: true });

      child.kill();
      done();
    });
  }, );

});
