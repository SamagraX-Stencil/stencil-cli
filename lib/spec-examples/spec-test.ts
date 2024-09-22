export const SpecFileContent = `
stencil: 0.0.1

info:
  properties:
    project-name: "final"
    package-manager: "npm"

tooling: [monitoring]

endpoints:
`;

export const InvalidSpecFileContent = `
stencil: 0.0.1
  info:
    properties:
      package-manager: "npm"
  tooling: [monitoring]  
`;

export const InvalidSpecFileContent2 = `
stencil: 0.0.1
  info:
    properties:
      project-name: "final"
  tooling: [monitoring]  
`;