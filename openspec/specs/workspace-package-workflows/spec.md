## ADDED Requirements

### Requirement: Workspace workflows SHALL only orchestrate web-vue and docs packages

The system SHALL limit supported root-level development and build orchestration to the component-library package and the docs package, without a separate tools-package stage.

#### Scenario: Root development workflow runs

- **WHEN** a developer runs the supported root development command
- **THEN** it orchestrates only the web-vue development flow and the sd-vue-docs development flow

#### Scenario: Root build workflow runs

- **WHEN** a developer or CI runs the supported root build command
- **THEN** it builds only the required web-vue and sd-vue-docs package workflows and does not build sd-vue-scripts as an intermediate step

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
