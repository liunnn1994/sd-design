## MODIFIED Requirements

### Requirement: web-vue SHALL own component-library tooling directly

The system SHALL provide component library development, packaging, declaration generation, style emission, test, and generation commands directly from packages/web-vue, with Vite+ owning the replaceable packaging entry points through a package-local vite.config.ts and without requiring any shared tooling package or external build wrapper layer.

#### Scenario: Developer starts component-library development

- **WHEN** a developer runs the supported component-library development command from packages/web-vue or the workspace root
- **THEN** the command resolves to package-local web-vue tooling, with Vite+ or Vite-managed watch behavior owning the replaceable development entry point rather than a custom Node.js wrapper around build APIs

#### Scenario: Component library production build runs

- **WHEN** the component library build workflow is executed
- **THEN** the workflow resolves packaging and declaration-generation behavior from packages/web-vue-local Vite+ configuration and emits the expected package outputs without invoking Babel-based library build plumbing or custom wrappers that only proxy Vite or vue-tsc behavior

### Requirement: Legacy sd-vue-scripts commands MUST map to general replacements

The system MUST replace each supported legacy-style component-library build command with the most general viable alternative, using Vite+ or standard tooling where possible and keeping package-local scripts only where repository-specific generation logic remains necessary.

#### Scenario: Standard tool replacement is available

- **WHEN** a legacy or current command only wraps Vite, TypeScript, vue-tsc, or equivalent packaging behavior
- **THEN** the replacement uses a Vite+ managed entry point from packages/web-vue instead of preserving a custom CLI wrapper or Babel-oriented build shim

#### Scenario: Repository-specific generation logic remains necessary

- **WHEN** a workflow depends on web-vue-specific directory conventions or generated assets such as icons, aggregated less entries, or editor metadata
- **THEN** the workflow remains an explicit package-local generation task that runs before packaging rather than being folded into a generic bundler-only abstraction

#### Scenario: Existing test and style workflows are reviewed during first-stage migration

- **WHEN** the first-stage Vite+ migration is implemented
- **THEN** Jest and stylelint remain supported package-local workflows and are not replaced solely as part of the packaging migration

### Requirement: Component-library test entry points SHALL remain package-local

The system SHALL expose supported component-library test commands from packages/web-vue directly, and any retained screenshot testing MUST also be owned and executed from packages/web-vue.

#### Scenario: Unit tests are executed

- **WHEN** a developer or CI runs the supported unit-test command for the component library
- **THEN** Jest configuration and invocation are resolved from packages/web-vue without sd-vue-scripts mediation

#### Scenario: Screenshot testing is retained

- **WHEN** the repository keeps screenshot regression testing as a supported workflow
- **THEN** that workflow is implemented and executed from packages/web-vue with an explicit underlying tool rather than an unimplemented sd-vue-scripts command
