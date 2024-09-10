## Swagger Command Overview
The `stencil add swagger` command helps developers to automatically generate Swagger decorators for controllers and DTOs. This ensures that the generated APIs are well-documented and aligned with the Swagger/OpenAPI specification. It can be used to initialize Swagger for a project or update existing files with the necessary decorators.

## Swagger Command

```
stencil add <subcommand> [modelName...] [options]

stencil as <subcommand> [modelName...] [options] 
```

Example: `stencil add swagger modelName` or `stencil as swagger modelName --init`

**Description**

The Swagger subcommand automates the process of adding Swagger decorators to existing controllers and DTOs. It initializes Swagger setup for the project and adds necessary `@nestjs/swagger` imports and decorators like `ApiProperty`, `ApiPropertyOptional`, `ApiOperation`, `ApiResponse`, etc., for DTOs and controllers.


**Arguments**

| Argument  |  Description |
|-----------|--------------|
|  `[modelName...]`	 | The model name for which Swagger decorators need to be added
 |

**Inputs**

| Name  |  Description |
|---|---|
|  `modelName`  | Adds Swagger decorators for the specified model's controller and DTO files
 |
|  `*` | Adds Swagger decorators for all models present in the schema.prisma
  |

**Options**

| Option  |  Description |
|---|---|
|  `--init`  | Initializes Swagger in the project (adds configuration to main.ts)
 |

**Supported Swagger Decorators:**

For Controllers: `ApiOperation`, `ApiResponse`, `ApiParam`, `ApiBody`, `ApiTags`

For DTOs: `ApiProperty`, `ApiPropertyOptional`
