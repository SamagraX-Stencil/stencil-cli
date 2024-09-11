## CRUD Command Overview
When the crud command is invoked through the Stencil CLI, a folder is created for each model specified. This folder contains all necessary files, such as Controller, Service, Interface and DTOs.

In addition to generating these files, the main module of the application is also updated to include the newly generated services and controllers.


## Crud Command

```
stencil crud [inputs...]
stencil cr [inputs...]
```

Example: `stencil crud model1` or `stencil crud *`

**Description**

Generate CRUD API for specified models.

**Arguments**

| Argument  |  Description |
|-----------|--------------|
|  `[inputs...]`	 | The model name for which crud api needs to be generated |

**Inputs**

| Name  |  Description |
|---|---|
|  `modelName`  | Generates a crud api for modelName |
|  `*` | Generates a crud api for all models present in schema.prisma  |

### Example structure of `schema.prisma`
```
model Book {
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
```
