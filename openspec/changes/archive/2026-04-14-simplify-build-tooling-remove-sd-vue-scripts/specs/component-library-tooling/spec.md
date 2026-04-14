## ADDED Requirements

### Requirement: web-vue SHALL own component-library tooling directly

The system SHALL provide component library development, build, test, and generation commands directly from packages/web-vue without requiring packages/sd-vue-scripts to exist or be prebuilt.

#### Scenario: Developer starts component-library development

- **WHEN** a developer runs the supported component-library development command from packages/web-vue or the workspace root
- **THEN** the command executes using web-vue-local scripts and configuration rather than a workspace dependency on sd-vue-scripts

#### Scenario: Component library production build runs

- **WHEN** the component library build workflow is executed
- **THEN** the workflow resolves all build steps from packages/web-vue and emits the expected package outputs without invoking sd-vue-scripts

### Requirement: Legacy sd-vue-scripts commands MUST map to general replacements

The system MUST replace each supported sd-vue-scripts command with the most general viable alternative, using standard tooling where possible and package-local scripts only where repository-specific logic remains necessary.

#### Scenario: Standard tool replacement is available

- **WHEN** a legacy command only wraps Vite, TypeScript, vue-tsc, Jest, or Playwright behavior
- **THEN** the replacement command uses that standard tool directly from packages/web-vue instead of preserving a custom CLI wrapper

#### Scenario: Repository-specific generation logic remains necessary

- **WHEN** a legacy command depends on web-vue-specific directory conventions or generated assets such as icons, aggregated less entries, or editor metadata
- **THEN** the replacement is implemented as a package-local script under packages/web-vue rather than as a restored shared tooling package

### Requirement: Component-library test entry points SHALL remain package-local

The system SHALL expose supported component-library test commands from packages/web-vue directly, and any retained screenshot testing MUST also be owned and executed from packages/web-vue.

#### Scenario: Unit tests are executed

- **WHEN** a developer or CI runs the supported unit-test command for the component library
- **THEN** Jest configuration and invocation are resolved from packages/web-vue without sd-vue-scripts mediation

#### Scenario: Screenshot testing is retained

- **WHEN** the repository keeps screenshot regression testing as a supported workflow
- **THEN** that workflow is implemented and executed from packages/web-vue with an explicit underlying tool rather than an unimplemented sd-vue-scripts command
