## Spec Command

```
stencil spec [filePath]
stencil sp [filePath]
```

Example: `stencil spec spec.yaml` or `stencil spec src/spec.yaml`

**Description**

Bootstraps the project based on given specification file.

**Arguments**

| Argument  |  Description |
|-----------|--------------|
|  `[filePath]`	 | The specification file along with path |

## Structure of spec.yaml
```
stencil: 0.0.1

info:
  properties:
    project-name: "ProjectName"
    package-manager: "npm" 
    
tooling: [logging]

endpoints:
```

*Supported Package Managers are npm, yarn, pnpm and bun.*

*Supported toolings are prisma, userService, temporal, monitoring, monitoringService, logging, fileUpload*


