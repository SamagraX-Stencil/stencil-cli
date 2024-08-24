## Docker Command

```
stencil docker <services...> [options]
stencil do <services...> [options]
```
**Description**

Creates a docker service/container for given command.
-  Tooling specific setup
    - Creates a folder with the given `<service>` inside docker directory
- À la Carte setup / Adhoc setup
    - Creates a docker compose or updates existing docker compose with desired `<service>`

**Arguments**

| Argument  |  Description |
|-----------|--------------|
|  `<service>`	 | The name of the new project |

**Options**

| Option  |  Description |
|-----------|--------------|
|  `--path [path]`	 | The path where the docker compose will be generated |


Note: Docker command supports multiple services at a time.

**Services**

-  Tooling specific setup


| Name  | Alias  |  Description |
|---|---|---|
|  `logging` | `lg`  | Generates a docker service for logging |
|  `monitoringService` |`ms`   | Generates a docker service for monitoring  |
|  `temporal` |  `tp` |  Generates a docker service for temporal |

- À la Carte setup / Adhoc setup


| Name  | Alias  |  Description |
|---|---|---|
|  `postgres` | `pg`  | Generate a docker compose for postgres |
|  `hasura` |`hs`   | Generate a docker compose for hasura  |

## How to include new docker services ?

**Stencil-cli**

1. Include the docker service in `lib/schematics/nest.collection.ts` with its name, alias and description.

**Schematics**
1. Create a folder inside of **schematics** package under `src/lib/docker/nameOfDockerService`
2. If the dockerService is a tooling setup then refer existing tooling setups such as temporal,monitoringService, logging.
     - Create `src/lib/docker/files/ts/nameOfDockerService` and paste all the necessary files needed to be generated when the service is called.
     - Create factory file, schema file and interface of the dockerService inside `src/lib/docker/nameOfDockerService` by refering existing tooling setup.
  3. If the dockerService is a adhoc setup then refer existing adhoc setup such as postgres, hasura.
     - Create factory file, schema file and interface of the dockerService inside `src/lib/docker/nameOfDockerService` by refering existing adhoc setup.
     - Paste the `docker-compose` and `.env` content inside of factory file refering existing adhoc setup.

## Which files will be changed/updated?

**Tooling setup**
- Basically whenever tooling setup is generated eg. `stencil docker temporal` , `docker/temporal` will be created.

**Adhoc Setup**
- Whenever adhoc setup is generated eg. `stencil docker postgres` , then` docker-compose`, `.env` and `docker-start.sh` is generated/updated.
