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
    
tooling: [prisma]
docker: [postgres]

endpoints:
```

*Supported Package Managers are npm, yarn, pnpm and bun.*

*Supported toolings are prisma, userService, temporal, monitoring, fileUpload*

*Supported docker services are logging, monitoring, postgres, hasura, minio, fusionauth*

[**Prisma**](https://www.prisma.io/)
- Stencil supports Prisma ORM to make it easy to work with databases. 
- Use Prisma when you need to interact with databases, perform CRUD operations, or manage complex database schemas.

[**Temporal**](temporal.io)
- Stencil supports Temporal, which is used as a workflow engine that can coordinate with microservices. 
- Use Temporal when you need to manage complex workflows, ensure reliable task execution, and reuse parts of your architecture in a modular way.

**File-Upload**
- Stencil comes with a file upload service that supports localhost and [min.io](https://min.io/) S3 cloud storage. 
- Use the file upload service when you need to handle file storage either locally or in the cloud, particularly for handling large files or integrating with S3-compatible storage solutions.

[**Monitoring**](https://stencil.samagra.io/monitoring/nestjs-monitor)
- Stencil comes with out-of-the-box support for creating Grafana dashboards automatically using custom-made NestJS Interceptors.
 - Use the monitoring service when you need to track application performance metrics, visualize them in Grafana, and automatically generate monitoring dashboards.



[**User-Service**](https://stencil.samagra.io/user-service/introduction)
- User-service, is a NestJS based user-management service.
- Use the User-service when you need to implement user authentication, authorization, and management features in your application, and want to leverage NestJS's dependency injection for integrating services.
