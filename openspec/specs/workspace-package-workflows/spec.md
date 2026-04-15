## MODIFIED Requirements

### Requirement: Workspace workflows SHALL only orchestrate web-vue and docs packages

The system SHALL keep supported root-level development, build, check, and test orchestration limited to the component-library package and the docs package, with vp run serving as the workspace entry point while package-local implementations continue to own the actual package behavior.

#### Scenario: Root development workflow runs

- **WHEN** a developer runs the supported root development command
- **THEN** the command uses vp run to orchestrate only the web-vue development flow and the sd-vue-docs development flow, with the docs package still executing its Astro-native dev command

#### Scenario: Root build workflow runs

- **WHEN** a developer or CI runs the supported root build command
- **THEN** the command uses vp run to orchestrate only the required web-vue and sd-vue-docs package workflows, with the docs package still executing its Astro-native build command

#### Scenario: Root validation workflows run

- **WHEN** a developer or CI runs the supported root check or test command
- **THEN** the workspace command routes through vp run while preserving the package-local validation tools currently used by web-vue and sd-vue-docs

### Requirement: Workspace dependency graph MUST remove sd-vue-scripts

The system MUST remove packages/sd-vue-scripts from active workspace dependencies, scripts, and release automation once its responsibilities have been migrated.

#### Scenario: Package manifests are reviewed

- **WHEN** package.json files and workspace metadata are inspected after the migration
- **THEN** they do not declare sd-vue-scripts as a workspace dependency or reference its commands in supported scripts

#### Scenario: Release workflow runs

- **WHEN** the release automation executes
- **THEN** it builds and releases web-vue using the migrated package-local commands and does not contain a dedicated sd-vue-scripts build step

### Requirement: Repository documentation MUST describe the simplified workflow

The system MUST update repository-facing documentation to describe the simplified two-package workflow and remove instructions that require prebuilding a tooling package.

#### Scenario: A maintainer follows the README quick start

- **WHEN** the maintainer reads repository setup and command documentation after the migration
- **THEN** the documented workflow describes only component-library and docs commands, without build:tools or other sd-vue-scripts prerequisites
